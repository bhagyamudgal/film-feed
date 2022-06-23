import React from "react";
import { Movie } from "../../models/Movie";
import type { MovieReview } from "../../pages";
import LoadingSkeleton from "../LoadingSkeleton";

export default function MoviesReviewsList({
  movieReviews,
}: {
  movieReviews: MovieReview[] | null;
}) {
  const renderMovieReviews = () => {
    if (movieReviews === null) {
      return (
        <div>
          <LoadingSkeleton height="8rem" />;
          <LoadingSkeleton height="8rem" />;
          <LoadingSkeleton height="8rem" />;
          <LoadingSkeleton height="8rem" />;
          <LoadingSkeleton height="8rem" />;
        </div>
      );
    }

    if (movieReviews.length === 0) {
      return (
        <p className="text-lg text-secondary-main text-center mt-10">
          No Reviews found!
        </p>
      );
    }

    return movieReviews.map((movieReview, index) => {
      return (
        <div className="movie-review-card" key={index}>
          <div className="flex justify-between mb-3 flex-wrap">
            <p className="font-medium my-2">{movieReview.title}</p>
            <p className="font-medium text-secondary-main my-2">
              <i className="bi bi-star-fill" /> {movieReview.rating}/5
            </p>
          </div>

          <div className="flex flex-col text-white my-2">
            <p>{movieReview.description}</p>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-12">
      <p className="text-primary-main mb-4 font-medium text-xl">
        <i className="bi bi-bookmark-fill" /> Movie Reviews
      </p>

      {renderMovieReviews()}
    </div>
  );
}
