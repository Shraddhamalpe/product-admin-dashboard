"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Product,
  getProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
} from "../../services/productService";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [limit, setLimit] = useState(
    Number(searchParams.get("limit")) || 10
  );

  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  const [categories, setCategories] = useState<string[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState(
      searchParams.get("category") || ""
    );

  const [sortBy, setSortBy] = useState(
    searchParams.get("sort") || ""
  );

  const requestIdRef = useRef(0);

  // Convert API prices from USD to INR.
  // Locally added products are already stored in INR.
  const getIndianPrice = (product: Product) => {
    if (product.isLocal) {
      return product.price;
    }

    return Math.round(product.price * 83);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("limit", String(limit));

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    if (selectedCategory) {
      params.set(
        "category",
        selectedCategory
      );
    }

    if (sortBy) {
      params.set("sort", sortBy);
    }

    router.replace(
      `/products?${params.toString()}`
    );
  }, [
    page,
    limit,
    searchQuery,
    selectedCategory,
    sortBy,
    router,
  ]);

  const totalPages = Math.ceil(
    total / limit
  );

  const startItem =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const endItem = Math.min(
    page * limit,
    total
  );

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(
        searchInput.trim()
      );
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data =
          await getCategories();

        setCategories(data);
      } catch (error) {
        console.error(
          "Category error:",
          error
        );
      }
    };

    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      const requestId =
        ++requestIdRef.current;

      try {
        setLoading(true);
        setError("");

        const skip =
          (page - 1) * limit;

        let data;

        if (selectedCategory) {
          data =
            await getProductsByCategory(
              selectedCategory,
              limit,
              skip
            );
        } else if (searchQuery) {
          data =
            await searchProducts(
              searchQuery,
              limit,
              skip
            );
        } else {
          data =
            await getProducts(
              limit,
              skip
            );
        }

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        let sortedProducts = [
          ...data.products,
        ];

        if (sortBy === "price-low") {
          sortedProducts.sort(
            (a, b) =>
              getIndianPrice(a) -
              getIndianPrice(b)
          );
        }

        if (sortBy === "price-high") {
          sortedProducts.sort(
            (a, b) =>
              getIndianPrice(b) -
              getIndianPrice(a)
          );
        }

        if (
          sortBy === "rating-high"
        ) {
          sortedProducts.sort(
            (a, b) =>
              b.rating - a.rating
          );
        }

        if (sortBy === "title-az") {
          sortedProducts.sort(
            (a, b) =>
              a.title.localeCompare(
                b.title
              )
          );
        }

        setProducts(
          sortedProducts
        );

        setTotal(data.total);
      } catch (error) {
        console.error(
          "Product error:",
          error
        );

        if (
          requestId !==
          requestIdRef.current
        ) {
          return;
        }

        setProducts([]);
        setTotal(0);
        setError(
          "Failed to load products."
        );
      } finally {
        if (
          requestId ===
          requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    };

    loadProducts();
  }, [
    page,
    limit,
    searchQuery,
    selectedCategory,
    sortBy,
  ]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading products...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Dashboard Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">
            Product Dashboard
          </h1>

          <div className="flex flex-wrap gap-3">

            {/* Add Product */}
            <button
              onClick={() =>
                router.push(
                  "/products/add"
                )
              }
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              + Add Product
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
            >
              Logout
            </button>

          </div>
        </div>

        {/* Search, Category and Sorting */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={selectedCategory}
            onChange={(event) => {
              setSelectedCategory(
                event.target.value
              );
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 sm:w-64"
          >
            <option value="">
              All Categories
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>

          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(
                event.target.value
              );
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 sm:w-64"
          >
            <option value="">
              Sort By
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating-high">
              Rating: High to Low
            </option>

            <option value="title-az">
              Title: A to Z
            </option>
          </select>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow">
            <p className="text-gray-600">
              No products found.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto rounded-lg bg-white shadow md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="p-4">
                      Image
                    </th>

                    <th className="p-4">
                      Title
                    </th>

                    <th className="p-4">
                      Category
                    </th>

                    <th className="p-4">
                      Price
                    </th>

                    <th className="p-4">
                      Rating
                    </th>

                    <th className="p-4">
                      Stock
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map(
                    (product) => (
                      <tr
                        key={product.id}
                        className="border-b"
                      >
                        <td className="p-4">
                          <img
                            src={
                              product.thumbnail
                            }
                            alt={
                              product.title
                            }
                            className="h-12 w-12 rounded object-cover"
                          />
                        </td>

                        <td className="p-4 font-medium">
                          <button
                            onClick={() =>
                              router.push(
                                `/products/${product.id}`
                              )
                            }
                            className="text-left hover:text-blue-600"
                          >
                            {
                              product.title
                            }
                          </button>
                        </td>

                        <td className="p-4">
                          {
                            product.category
                          }
                        </td>

                        <td className="p-4">
                          ₹
                          {getIndianPrice(
                            product
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td className="p-4">
                          ⭐{" "}
                          {
                            product.rating
                          }
                        </td>

                        <td className="p-4">
                          {
                            product.stock
                          }
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {products.map(
                (product) => (
                  <div
                    key={product.id}
                    className="rounded-lg bg-white p-4 shadow"
                  >
                    <div className="flex gap-4">
                      <img
                        src={
                          product.thumbnail
                        }
                        alt={
                          product.title
                        }
                        className="h-20 w-20 flex-shrink-0 rounded object-cover"
                      />

                      <div className="min-w-0">
                        <button
                          onClick={() =>
                            router.push(
                              `/products/${product.id}`
                            )
                          }
                          className="text-left font-semibold hover:text-blue-600"
                        >
                          {
                            product.title
                          }
                        </button>

                        <p className="mt-1 text-sm text-gray-500">
                          {
                            product.category
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4 text-sm">
                      <div>
                        <p className="text-gray-500">
                          Price
                        </p>

                        <p className="font-medium">
                          ₹
                          {getIndianPrice(
                            product
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">
                          Rating
                        </p>

                        <p className="font-medium">
                          ⭐{" "}
                          {
                            product.rating
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-500">
                          Stock
                        </p>

                        <p className="font-medium">
                          {
                            product.stock
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="pageSize"
                  className="text-sm text-gray-600"
                >
                  Show:
                </label>

                <select
                  id="pageSize"
                  value={limit}
                  onChange={(event) => {
                    setLimit(
                      Number(
                        event.target.value
                      )
                    );
                    setPage(1);
                  }}
                  className="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm"
                >
                  <option value={10}>
                    10
                  </option>

                  <option value={20}>
                    20
                  </option>

                  <option value={50}>
                    50
                  </option>
                </select>

                <span className="text-sm text-gray-600">
                  products
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Showing {startItem}–
                {endItem} of {total}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    setPage(
                      page - 1
                    )
                  }
                  disabled={page === 1}
                  className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) => (
                    <button
                      key={
                        index + 1
                      }
                      onClick={() =>
                        setPage(
                          index + 1
                        )
                      }
                      className={`rounded px-3 py-2 text-sm ${
                        page ===
                        index + 1
                          ? "bg-blue-600 text-white"
                          : "border bg-white text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setPage(
                      page + 1
                    )
                  }
                  disabled={
                    page ===
                      totalPages ||
                    totalPages === 0
                  }
                  className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}