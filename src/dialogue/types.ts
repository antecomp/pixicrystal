export type DialogueOption = {
    text: string;
    next: DialogueNode;
}

export type DialogueNode = {
    text: string;
    // Otherwise inherit from parent.
    face?: string;
} & ({
    next?: DialogueNode;
} | {
    options: DialogueOption[];
});
