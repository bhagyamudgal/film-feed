import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Head from "next/head";
import MovieReviewForm from "../components/MovieReviewForm";
import MoviesReviewsList from "../components/MovieReviewsList";
import type { SolanaNetworkType } from "./_app";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Movie } from "../models/Movie";

interface HomePageProps {
  solanaNetwork: SolanaNetworkType;
}

export type MovieReview = {
  title: string;
  rating: number;
  description: string;
  ownerPubKey: string;
};

const Home: NextPage<HomePageProps> = ({ solanaNetwork }: HomePageProps) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [movieReviews, setMovieReviews] = useState<MovieReview[] | [] | null>(
    null
  );
  const [refreshData, setRefreshData] = useState(1);

  const getMovieReviews = async () => {
    try {
      if (!wallet.publicKey) {
        return;
      }

      setMovieReviews(null);

      const programAddress = process.env.NEXT_PUBLIC_MOVIE_REVIEW_PROGRAM_ID;

      if (!programAddress) {
        return;
      }

      const programId = new PublicKey(programAddress);

      const movieReviewsAccounts = await connection.getProgramAccounts(
        programId
      );

      let movieReviews: any = movieReviewsAccounts.map((account) => {
        if (account.account.data) {
          const movieReviewData = Movie.deserialize(account.account.data);

          if (!movieReviewData) {
            return null;
          }

          return {
            title: movieReviewData.title,
            rating: movieReviewData.rating,
            description: movieReviewData.description,
          };
        }
      });

      movieReviews = movieReviews.filter(
        (movieReview: MovieReview) =>
          movieReview !== null &&
          movieReview.rating >= 0 &&
          movieReview.rating <= 5
      );

      if (movieReviews) {
        setMovieReviews(movieReviews);
      }
    } catch (error: any) {
      console.error("getMovieReviews =>", error.message);
      setMovieReviews([]);
    }
  };

  useEffect(() => {
    if (refreshData) {
      getMovieReviews();
    }
  }, [refreshData, wallet]); // eslint-disable-line

  return (
    <div className="page">
      <Head>
        <title>Film Feed | Review Movies on Solana</title>
        <meta
          name="description"
          content="Film Feed is a decentralized application built over Solana blockchain which helps its users to post review about any movie and store it on Solana blockchain forever. Developed by Bhagya Mudgal"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="main">
        <h1 className="heading-1 text-center mb-10">
          Review Movies on Solana using <u>Film Feed</u>
        </h1>

        {!wallet.connected && (
          <p className="text-xl text-primary-main text-center mt-20">
            Please connect wallet to use the application 🙂
          </p>
        )}

        {wallet.connected && (
          <MovieReviewForm
            solanaNetwork={solanaNetwork}
            setRefreshData={setRefreshData}
          />
        )}

        {wallet.connected && <MoviesReviewsList movieReviews={movieReviews} />}
      </div>
    </div>
  );
};

export default Home;
