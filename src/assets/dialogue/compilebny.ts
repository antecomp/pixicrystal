// 𑣲₍ ᐢ. .ᐢ₎
// .bny dialogue compiler

import { DialogueNode } from "../../dialogue";
import { build } from "./builder";
import { resetIdCounter } from "./genid";
import { DialogueLexer } from "./lexer";
import { DialogueParser } from "./parser";
import { flatten } from "./processor";
import { DialogueVisitor } from "./visitor";

const parser = new DialogueParser();
const visitor = new DialogueVisitor();

export function compileBnyDialogue(raw: string): DialogueNode | null {
    resetIdCounter();

    const lexResult = DialogueLexer.tokenize(raw);
    if (lexResult.errors.length > 0) {
        console.error("Lex errors:", lexResult.errors);
        return null;
    }

    parser.input = lexResult.tokens;
    const cst = parser.dialogue();
    if (parser.errors.length > 0) {
        console.error("Parse errors:", parser.errors);
        return null;
    }

    const tree = visitor.visit(cst);
    const flatResult = flatten(tree);
    return build(flatResult);
}
