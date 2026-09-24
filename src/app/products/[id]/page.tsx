
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Product,
  getProductById,
  deleteProduct,
  getIndianPrice,
} from "../../../services/productService";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] =
    useState("");

  const [deleting, setDeleting] = useState(false);
  const [showDeletePopup, setShowDeletePopup] =
    useState(false);

  const productId = params.id as string;

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProductById(productId);

        setProduct(data);

        if (data.thumbnail) {
          setSelectedImage(data.thumbnail);
        } else if (
          data.images &&
          data.images.length > 0
        ) {
          setSelectedImage(data.images[0]);
        }
      } catch (error) {
        console.error(
          "Product details error:",
          error
        );

        setProduct(null);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleDelete = async () => {
    if (deleting) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteProduct(productId);

      router.push("/products");
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      setError(
        "Failed to delete product. Please try again."
      );

      setDeleting(false);
      setShowDeletePopup(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading product...</p>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <h1 className="mb-3 text-xl font-semibold">
            Product not found
          </h1>

          <p className="mb-5 text-gray-600">
            The product you are looking for does not
            exist.
          </p>

          <button
            onClick={() => router.push("/products")}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images ?? [];
  const reviews = product.reviews ?? [];

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <button
          onClick={() => router.push("/products")}
          className="mb-6 rounded border bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          ← Back to Products
        </button>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-white p-5 shadow sm:p-8">

          {/* Product Information */}
          <div className="grid gap-8 md:grid-cols-2">

            {/* Images */}
            <div>
              <div className="flex h-80 items-center justify-center rounded-lg bg-gray-50 p-4">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <p className="text-gray-500">
                    No image available
                  </p>
                )}
              </div>

              {images.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {images.map(
                    (image, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setSelectedImage(image)
                        }
                        className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded border p-2 ${
                          selectedImage === image
                            ? "border-blue-600"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.title} ${
                            index + 1
                          }`}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <p className="mb-2 text-sm capitalize text-gray-500">
                {product.category}
              </p>

              <h1 className="mb-4 text-2xl font-bold sm:text-3xl">
                {product.title}
              </h1>

              <p className="mb-4 text-gray-600">
                {product.description}
              </p>

              <div className="mb-4">
                <span className="text-2xl font-bold">
                  ₹{getIndianPrice(product).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mb-5 flex flex-wrap gap-4">
                <p>
                  <span className="text-gray-500">
                    Rating:
                  </span>{" "}
                  ⭐ {product.rating}
                </p>

                <p>
                  <span className="text-gray-500">
                    Stock:
                  </span>{" "}
                  {product.stock}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">

                {/* Edit */}
                <button
                  onClick={() =>
                    router.push(
                      `/products/${productId}/edit`
                    )
                  }
                  className="rounded bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                  Edit Product
                </button>

                {/* Delete */}
                <button
                  onClick={() =>
                    setShowDeletePopup(true)
                  }
                  disabled={deleting}
                  className="rounded bg-red-600 px-5 py-2.5 font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete Product
                </button>

              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-10 border-t pt-8">
            <h2 className="mb-5 text-xl font-bold">
              Reviews
            </h2>

            {reviews.length === 0 ? (
              <p className="text-gray-500">
                No reviews available.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map(
                  (review, index) => (
                    <div
                      key={index}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="font-semibold">
                          {review.reviewerName}
                        </h3>

                        <span className="text-sm text-gray-500">
                          ⭐ {review.rating}
                        </span>
                      </div>

                      <p className="text-gray-600">
                        {review.comment}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(
                          review.date
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">

            <h2 className="mb-3 text-xl font-bold">
              Delete Product?
            </h2>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {product.title}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">

              {/* Cancel */}
              <button
                onClick={() =>
                  setShowDeletePopup(false)
                }
                disabled={deleting}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {/* Confirm Delete */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}
