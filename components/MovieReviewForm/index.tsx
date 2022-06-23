import { FormEvent, useRef, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Transaction,
  PublicKey,
  TransactionInstruction,
  SystemProgram,
} from "@solana/web3.js";
import { Movie } from "../../models/Movie";
import { checkTransactionConfirmation } from "../../utils/General";
import { toast } from "react-toastify";
import { Buffer } from "buffer";
import type { SolanaNetworkType } from "../../pages/_app";
import { customPromiseToast } from "../Notification/index";

interface MovieReviewFormProps {
  solanaNetwork: SolanaNetworkType;
  setRefreshData: (value: any) => void;
}

export default function MovieReviewForm({
  solanaNetwork,
  setRefreshData,
}: MovieReviewFormProps) {
  const movieNameRef = useRef<HTMLInputElement | null>(null);
  const movieReviewRef = useRef<HTMLTextAreaElement | null>(null);
  const movieRatingRef = useRef<HTMLInputElement | null>(null);

  const [isBusy, setIsBusy] = useState(false);

  const { connection } = useConnection();
  const wallet = useWallet();

  const resetForm = () => {
    const movieReviewForm = document.getElementById(
      "movie-review-form"
    ) as HTMLFormElement;

    movieReviewForm.reset();
  };

  const submitReviewHandler = async (event: FormEvent) => {
    setIsBusy(true);
    toast.dismiss();
    const toastId = customPromiseToast("Submitting Review", "loading");

    if (!toastId) {
      return;
    }

    try {
      event.preventDefault();

      const programAddress = process.env.NEXT_PUBLIC_MOVIE_REVIEW_PROGRAM_ID;

      if (wallet.publicKey && programAddress) {
        const movieName = movieNameRef?.current?.value;
        const movieReview = movieReviewRef?.current?.value;
        const movieRating = Number(movieRatingRef?.current?.value);

        if (movieName && movieRating && movieReview) {
          const movie = new Movie(movieName, movieRating, movieReview);

          const buffer = movie.serialize();

          const transaction = new Transaction();

          const programId = new PublicKey(programAddress);

          const allProgramAccounts = await connection.getProgramAccounts(
            programId
          );

          const [pda] = await PublicKey.findProgramAddress(
            [wallet.publicKey.toBuffer(), Buffer.from(movie.title)],
            programId
          );

          const movieReviewAlreadyExists = allProgramAccounts.find(
            (account: any) => account.pubkey.toString() === pda.toString()
          );

          if (movieReviewAlreadyExists) {
            setIsBusy(false);
            customPromiseToast(
              "Review already exists for this movie name!",
              "error",
              toastId
            );
            return;
          }

          const instruction = new TransactionInstruction({
            keys: [
              {
                pubkey: wallet.publicKey,
                isSigner: true,
                isWritable: false,
              },
              {
                pubkey: pda,
                isSigner: false,
                isWritable: true,
              },
              {
                pubkey: SystemProgram.programId,
                isSigner: false,
                isWritable: false,
              },
            ],
            data: buffer,
            programId,
          });

          transaction.add(instruction);

          const signature = await wallet.sendTransaction(
            transaction,
            connection
          );

          const isConfirmed = await checkTransactionConfirmation(
            connection,
            signature
          );

          if (isConfirmed) {
            customPromiseToast(
              "Review submitted successfully!",
              "success",
              toastId
            );

            setRefreshData((prevState: number) => prevState + 1);
          } else {
            customPromiseToast(
              "Failed to confirm transaction!",
              "error",
              toastId
            );
          }

          console.log(
            `Transaction submitted: https://explorer.solana.com/tx/${signature}?cluster=${solanaNetwork}`
          );
        }
      }
      setIsBusy(false);
      resetForm();
    } catch (error: any) {
      setIsBusy(false);
      resetForm();
      console.error("movieReviewFormHandler => ", error.message);
      customPromiseToast("Something went wrong!", "error", toastId);
    }
  };
  return (
    <div className="max-w-xl mx-auto rounded-md">
      <p className="text-primary-main mb-4 font-medium text-xl">
        <i className="bi bi-chat-right-dots-fill" /> Add a Review
      </p>

      <form
        id="movie-review-form"
        className="form border border-white p-3 sm:p-5 my-6"
        onSubmit={submitReviewHandler}
        autoComplete="off"
      >
        <div className="form-element">
          <label htmlFor="movie-name" className="form-label">
            <i className="bi bi-arrow-right-square-fill" /> Movie Name *
          </label>
          <input
            type="text"
            name="movie-name"
            className="form-input"
            placeholder="Enter name of movie"
            required
            ref={movieNameRef}
          />
        </div>

        <div className="form-element">
          <label htmlFor="movie-review" className="form-label">
            <i className="bi bi-arrow-right-square-fill" /> Movie Review *
          </label>
          <textarea
            name="movie-review"
            cols={30}
            rows={5}
            className="form-input resize-none"
            placeholder="Enter your review about the movie"
            required
            ref={movieReviewRef}
          />
        </div>

        <div className="form-element">
          <label htmlFor="movie-rating" className="form-label">
            <i className="bi bi-arrow-right-square-fill" /> Movie Rating *
          </label>
          <input
            type="number"
            name="movie-rating"
            className="form-input"
            placeholder="Enter rating out of 5"
            min={0}
            max={5}
            required
            ref={movieRatingRef}
          />
        </div>

        <div className="form-element items-center mb-0">
          <button type="submit" className="form-button" disabled={isBusy}>
            Submit Review
          </button>
        </div>
      </form>
    </div>
  );
}
