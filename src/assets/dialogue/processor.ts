// Takes simplified tree from Visitor and flattens it into plain set of UnlinkedNodes.
// UnlinkedNodes track connections with IDs, that will then be converted into proper DialogueNodes and linked later.

import { generateId } from "./genid";
import { NodeTree, OptionTree, TextTree } from "./visitor";

type NodeRef =
    | { kind: 'id'; value: string }  // resolved node reference
    | { kind: 'label'; value: string }  // unresolved goto target

export type UnlinkedNode = {
    id: string;
    text: string;
    next: NodeRef | null;
    options?: {
        text: string;
        next: NodeRef | null;
    }[];
};

export type FlattenResult = {
    nodes: UnlinkedNode[];
    labels: Record<string, string>; // label name → node id
};

export function flatten(tree: NodeTree[]): FlattenResult {
    const nodes: UnlinkedNode[] = [];
    const labels: Record<string, string> = {};

    flattenSequence(tree, null, nodes, labels);

    // Second pass — resolve label refs to id refs
    for (const node of nodes) {
        node.next = resolveRef(node.next, labels);
        if (node.options) {
            for (const option of node.options) {
                option.next = resolveRef(option.next, labels);
            }
        }
    }

    return { nodes, labels };
}

function resolveRef(ref: NodeRef | null, labels: Record<string, string>): NodeRef | null {
    if (!ref) return null;
    if (ref.kind === 'id') return ref;
    return labels[ref.value] ? { kind: 'id', value: labels[ref.value] } : null;
}

function idRef(value: string): NodeRef {
    return { kind: 'id', value };
}

function labelRef(value: string): NodeRef {
    return { kind: 'label', value };
}

function flattenSequence(
    sequence: NodeTree[],
    fallback: NodeRef | null,
    nodes: UnlinkedNode[],
    labels: Record<string, string>
): void {
    for (let i = 0; i < sequence.length; i++) {
        const node = sequence[i];

        if (node.kind === 'goto') {
            // Attach label ref to previous node and discard
            if (nodes.length > 0) {
                nodes[nodes.length - 1].next = labelRef(node.target);
            }
            continue;
        }

        const nextRef = findNextRef(sequence, i) ?? fallback;

        if (node.label) {
            labels[node.label] = node.id;
        }

        const unlinked: UnlinkedNode = {
            id: node.id,
            text: node.text,
            next: node.block ? null : nextRef,
        };

        if (node.block) {
            unlinked.options = flattenBlock(node.block, node.text, nextRef, nodes, labels);
        }

        nodes.push(unlinked);
    }
}

function flattenBlock(
    block: OptionTree[],
    parentPrompt: string,
    fallback: NodeRef | null,
    nodes: UnlinkedNode[],
    labels: Record<string, string>
): UnlinkedNode["options"] {
    return block.map(option => {
        // When we have a nested block, we generate a fake node in-between that inherits the text of the parent owning it.
        if (option.nestedBlock) {
            const syntheticId = generateId();
            const synthetic: UnlinkedNode = {
                id: syntheticId,
                text: parentPrompt,
                next: null,
                options: flattenBlock(option.nestedBlock, parentPrompt, fallback, nodes, labels),
            };
            nodes.push(synthetic);
            return { text: option.text, next: idRef(syntheticId) };
        }

        const firstNode = option.branch.find(n => n.kind === 'text') as TextTree | undefined;
        const firstRef = firstNode ? idRef(firstNode.id) : fallback;
        flattenSequence(option.branch, fallback, nodes, labels);

        return { text: option.text, next: firstRef };
    });
}

// Finds the ref of the next real text node in the sequence, skipping gotos
function findNextRef(sequence: NodeTree[], i: number): NodeRef | null {
    for (let j = i + 1; j < sequence.length; j++) {
        if (sequence[j].kind === 'text') return idRef((sequence[j] as TextTree).id);
    }
    return null;
}