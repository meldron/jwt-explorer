import classNames from "classnames";
import { JSX } from "solid-js";
import { SignatureStatusValues } from "./Signature";

export interface SignatureStatusProps {
    status: SignatureStatusValues;
}

export function SignatureStatus(props: SignatureStatusProps): JSX.Element {
    return (
        <span
            class={classNames(
                "badge",
                "badge-lg",
                { "badge-success": props.status === "Valid" },
                { "badge-error": props.status === "Invalid" }
            )}
        >
            Status: {props.status}
        </span>
    );
}
