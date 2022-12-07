import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";
import { JSX } from "solid-js/jsx-runtime";

export function JsonEditor(): JSX.Element {
    const container = <div />;

    const startState = EditorState.create({
        doc: "Hello World",
        extensions: [],
    });

    const view = new EditorView({
        state: startState,
        parent: container as Element,
    });

    const compartment = new Compartment();

    view.dispatch({ effects: compartment.reconfigure(EditorState.readOnly.of(true)) });
    view.dispatch({ selection: { anchor: 2, head: 0 } });

    return container;
}
