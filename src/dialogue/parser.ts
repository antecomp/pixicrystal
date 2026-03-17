/*
dialogue    -> statement*
statement   -> textNode | goto | skipBlock | matchBlock
goto        -> Goto Text Newline?
textNode    -> (Label Text Newline)? Text (optionBlock | Newline?)
optionBlock -> Newline? BlockOpen Newline choice+ BlockClose Newline?
choice      -> Option Text (optionBlock | Newline statement*)
skipBlock   -> OpenBracket BlockKeyword Text CloseBracket Newline statement* OpenBracket TagClose BlockKeyword CloseBracket Newline?
matchBlock  -> OpenBracket MatchKeyword Text CloseBracket Newline matchBranch+ OpenBracket TagClose MatchKeyword CloseBracket Newline?
matchBranch -> Equals Text Newline statement*
Plus a bunch of bs to make Newline optional actually for EOF because im dumb
*/

import { CstParser } from "chevrotain";
import { BlockClose, BlockOpen, Equals, Goto, Label, Newline, Text, Option, OpenBracket, CloseBracket, TagClose, BlockKeyword, MatchKeyword } from "./lexer";

export class DialogueParser extends CstParser {
    constructor() {
        super([
            Text, Label, Goto, Option,
            BlockOpen, BlockClose,
            OpenBracket, CloseBracket,
            TagClose, BlockKeyword, MatchKeyword,
            Equals, Newline
        ]);
        this.performSelfAnalysis();
    }

    dialogue = this.RULE("dialogue", () => {
        this.OPTION(() => this.CONSUME(Newline));  // leading newline
        this.MANY(() => this.SUBRULE(this.statement))
        // this.OPTION2(() => this.CONSUME2(Newline)); // Trailing newline (do we need this?)
    });

    statement = this.RULE("statement", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.textNode) },
            { ALT: () => this.SUBRULE(this.goto) },
            { ALT: () => this.SUBRULE(this.skipBlock) },
            { ALT: () => this.SUBRULE(this.matchBlock) },
        ]);
    });

    goto = this.RULE("goto", () => {
        this.CONSUME(Goto);
        this.CONSUME(Text);
        this.OPTION(() => this.CONSUME(Newline)); // optional trailing newline for EOF
    });

    textNode = this.RULE("textNode", () => {
        this.OPTION(() => {
            this.CONSUME(Label);
            this.CONSUME1(Text);
            this.CONSUME1(Newline);
        });
        this.CONSUME2(Text);
        this.OR([
            { ALT: () => this.SUBRULE(this.optionBlock) },
            { ALT: () => this.OPTION2(() => this.CONSUME2(Newline)) }, // optional trailing newline for EOF
        ]);
    });

    optionBlock = this.RULE("optionBlock", () => {
        this.OPTION(() => this.CONSUME1(Newline));
        this.CONSUME(BlockOpen);
        this.CONSUME2(Newline);
        this.MANY(() => this.SUBRULE(this.choice));
        this.CONSUME(BlockClose);
        this.OPTION2(() => this.CONSUME3(Newline));  // optional trailing newline for EOF
    });

    choice = this.RULE("choice", () => {
        this.CONSUME(Option);
        this.CONSUME(Text);
        this.OR([
            { ALT: () => this.SUBRULE(this.optionBlock) },
            {
                ALT: () => {
                    this.CONSUME(Newline);
                    this.MANY(() => this.SUBRULE(this.statement));
                }
            }
        ]);
    });

    skipBlock = this.RULE("skipBlock", () => {
        this.CONSUME(OpenBracket);
        this.CONSUME(BlockKeyword);
        this.CONSUME(Text);         // label name
        this.CONSUME(CloseBracket);
        this.CONSUME(Newline);
        this.MANY(() => this.SUBRULE(this.statement));
        this.CONSUME2(OpenBracket);
        this.CONSUME(TagClose);
        this.CONSUME2(BlockKeyword); // [/block]
        this.CONSUME2(CloseBracket);
        this.OPTION(() => this.CONSUME2(Newline));
    });

    matchBlock = this.RULE("matchBlock", () => {
        this.CONSUME(OpenBracket);
        this.CONSUME(MatchKeyword);
        this.CONSUME(Text);         // function name
        this.CONSUME(CloseBracket);
        this.CONSUME(Newline);
        this.MANY1(() => this.SUBRULE(this.matchBranch));
        this.CONSUME2(OpenBracket);
        this.CONSUME(TagClose);
        this.CONSUME2(MatchKeyword); // [/match]
        this.CONSUME2(CloseBracket);
        this.OPTION(() => this.CONSUME2(Newline));
    });

    matchBranch = this.RULE("matchBranch", () => {
        this.CONSUME(Equals);
        this.CONSUME(Text);         // match value
        this.CONSUME(Newline);
        this.MANY(() => this.SUBRULE(this.statement));
    });
}