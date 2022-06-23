import { Connection, TransactionSignature } from "@solana/web3.js";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export async function isBlockhashExpired(
  connection: Connection,
  initialBlockHeight: number
) {
  let currentBlockHeight = await connection.getBlockHeight();

  return currentBlockHeight > initialBlockHeight;
}

export const checkTransactionConfirmation = async (
  connection: Connection,
  signature: TransactionSignature
) => {
  const statusCheckInterval = 300;
  const timeout = 90000;
  let isBlockhashValid = true;

  const initialBlock = (await connection.getSignatureStatus(signature)).context
    .slot;

  let done = false;

  setTimeout(() => {
    if (done) {
      return;
    }
    done = true;
    console.log("Timed out for signature", signature);
    console.log(
      `${
        isBlockhashValid
          ? "Blockhash not yet expired."
          : "Blockhash has expired."
      }`
    );
  }, timeout);

  while (!done && isBlockhashValid) {
    const confirmation = await connection.getSignatureStatus(signature);

    if (
      confirmation.value &&
      (confirmation.value.confirmationStatus === "confirmed" ||
        confirmation.value.confirmationStatus === "finalized")
    ) {
      console.log(
        `Confirmation Status: ${confirmation.value.confirmationStatus}`,
        signature
      );
      done = true;
    } else {
      console.log(
        `Confirmation Status: ${
          confirmation.value?.confirmationStatus || "not yet found."
        }`
      );
    }
    isBlockhashValid = !(await isBlockhashExpired(connection, initialBlock));
    await sleep(statusCheckInterval);
  }

  return done;
};
