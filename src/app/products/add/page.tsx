"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { addProduct } from "../../../services/productService";

export default function AddProductPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

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

      await addProduct({
        title: title.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim(),
        description: description.trim(),
      });

      setSuccess("Product added successfully.");

      setTitle("");
      setPrice("");
      setStock("");
      setCategory("");
      setDescription("");
    } catch (error) {
      console.error("Add product error:", error);
      setError("Failed to add product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.push("/products")}
          className="mb-6 rounded border bg-white px-4 py-2 text-sm"
        >
          ← Back to Products
        </button>

        <div className="rounded-lg bg-white p-6 shadow sm:p-8">
          <h1 className="mb-6 text-2xl font-bold">
            Add Product
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

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}