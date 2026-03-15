import { DialogueParser } from "./parser";
import { DialogueVisitor } from "./visitor";
import { resetIdCounter } from "./genid";
import { DialogueLexer } from "./lexer";
import { flatten } from "./processor";
import { build } from "./builder";

const parser = new DialogueParser();
const visitor = new DialogueVisitor();

function testVisitor(input: string) {
    resetIdCounter();

    const lexResult = DialogueLexer.tokenize(input);
    parser.input = lexResult.tokens;
    const cst = parser.dialogue();

    if (parser.errors.length > 0) {
        console.error("Parse errors:", parser.errors);
        return;
    }

    const tree = visitor.visit(cst);
    console.log(JSON.stringify(tree, null, 2));

    const result = flatten(tree);
    console.log("=== nodes ===");
    for (const node of result.nodes) {
        console.log({
            id: node.id,
            text: node.text,
            next: node.next,
            options: node.options?.map(o => ({ text: o.text, next: o.next }))
        });
    }

    console.log("\n=== labels ===");
    console.log(result.labels);

    console.log("\n======FINAL");
    const built = build(result);
    console.log(built);
}



export default function test() {
    testVisitor(`
#comment
@start
Hello, friend.
How are you? {
    ?: Doing well!
        @nestedlabel
        That is great to hear.
    ?: Doing bad.
        Sorry to hear that.
        -> elsewhere
    ?: I will not tell {
        ?: ...because I hate you
        mean!
    }
}
        #comment
Fallback here.
        #comment
@elsewhere
We jumped here.
        #comment
`);
}