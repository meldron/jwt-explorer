import { createStore } from "solid-js/store";
import { SignatureStatusValues } from "../components/Signature";
import { Jwt } from "../jwt";

export interface JwtStore {
    secret: string;
    nativeSecret: Date | null;
    signatureStatus: SignatureStatusValues;
    jwt: Jwt | null;
    raw: string;
}

function getDefaultState(): JwtStore {
    return { jwt: null, secret: "", signatureStatus: "Unknown", raw: "", nativeSecret: null };
}

export const [jwtStore, setJwtStore] = createStore<JwtStore>(getDefaultState());

export function setJwt(jwt: Jwt | null) {
    setJwtStore("jwt", jwt);
}

export function setRawJwt(raw: string) {
    setJwtStore("raw", raw);
}

export function setSecret(secret: string) {
    setJwtStore("secret", secret);
}

export function setNativeSecret(hasSecret: boolean) {
    const nativeSecret = hasSecret ? new Date() : null;
    setJwtStore("nativeSecret", nativeSecret);
}

export function setSignatureStatus(status: SignatureStatusValues) {
    setJwtStore("signatureStatus", status);
}

export function resetStore() {
    setJwtStore(getDefaultState());
}
