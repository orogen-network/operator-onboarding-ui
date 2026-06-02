/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OROGEN_INDEXER_URL?: string;
  readonly VITE_OROGEN_FORGE_RPC_URL?: string;
  readonly VITE_OROGEN_GATEWAY_URL?: string;
  readonly VITE_OROGEN_FAUCET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
