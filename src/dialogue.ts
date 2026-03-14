import { AvailableFace, FaceChangeFn } from "./faces"
import { ChangeTextFn } from "./text";

export type DialogueNode = {
    text: string,
    // Otherwise inherit from parent.
    face?: AvailableFace,
} & ({
    next?: DialogueNode
} | {
    options: {
        text: string,
        next: DialogueNode
    }[]
});

export const TEST_DIALOGUE: DialogueNode = {
    text: "This is the first line of text",
    face: 'smile',
    next: {
        text: 'Wow more text!',
        face: 'pleased',
        next: {
            text: 'Jeg tilintetgjør haterne mine ved å bli venn med dem.',
            next: {
                text: 'Okay that is enough text',
                face: 'weary'
            }
        }
    }
}

export default function createDialogueRunner(root: DialogueNode = TEST_DIALOGUE, deps: { changeFace: FaceChangeFn, changeText: ChangeTextFn }) {
    // TODO: Utilize promises returned by the change methods to block interaction until ready.

    let current = root;

    if (root.face) deps.changeFace(root.face);
    deps.changeText(root.text);

    function proceed() {
        if ('next' in current && current.next) {
            current = current.next;
            if (current.face) deps.changeFace(current.face);
            deps.changeText(current.text);
            //return;

            // TODO: Display options if navigated-into node has them.
            // should fall through into the other current
        }

        if ('options' in current) {
            // have this function return the option handlers.
            return current.options.map(option => ({
                run: () => {
                    // Todo: clean this up to reduce code duplication
                    if ('next' in option) {
                        current = option.next;
                        if (current.face) deps.changeFace(current.face);
                        deps.changeText(current.text)
                    }
                },
                text: option.text
            })
            )
        }
    }

    return { proceed }

}