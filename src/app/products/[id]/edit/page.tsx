"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getProductById,
  updateProduct,
} from "../../../../services/productService";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const product = await getProductById(productId);

        setTitle(product.title);
        setPrice(String(product.price));
        setStock(String(product.stock));
        setCategory(product.category);
        setDescription(product.description);
      } catch (error) {
        console.error("Load product error:", error);
        setError("Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (!stock || Number(stock) < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    if (!category.trim()) {
      setError("Category is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    try {
      setSaving(true);

      await updateProduct(productId, {
        title: title.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim(),
        description: description.trim(),
      });

      setSuccess("Product updated successfully.");

      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, 800);
    } catch (error) {
      console.error("Update product error:", error);
      setError(
        "Failed to update product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading product...</p>
      </main>
    );
  }

  if (error && !title) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <p className="mb-5 text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              router.push(`/products/${productId}`)
            }
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Back to Product
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">

        <button
          onClick={() =>
            router.push(`/products/${productId}`)
          }
          className="mb-6 rounded border bg-white px-4 py-2 text-sm"
        >
          ← Back to Product
        </button>

        <div className="rounded-lg bg-white p-6 shadow sm:p-8">

          <h1 className="mb-6 text-2xl font-bold">
            Edit Product
          </h1>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium"
              >
                Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter product title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="mb-1 block text-sm font-medium"
              >
                Price
              </label>

              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="Enter price"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label
                htmlFor="stock"
                className="mb-1 block text-sm font-medium"
              >
                Stock
              </label>

              <input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                placeholder="Enter stock quantity"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium"
              >
                Category
              </label>

              <input
                id="category"
                type="text"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                placeholder="Enter category"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter product description"
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Updating..."
                : "Update Product"}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}