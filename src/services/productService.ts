import api from "../lib/axios";

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string[];
  reviews: Review[];
  isLocal?: boolean;
}

// Shared price function
// API products: USD → INR
// Local products: already in INR
export const getIndianPrice = (
  product: Product
): number => {
  if (product.isLocal) {
    return product.price;
  }

  return Math.round(product.price * 83);
};

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

const LOCAL_PRODUCTS_KEY =
  "admin-dashboard-products";

const DELETED_PRODUCTS_KEY =
  "admin-dashboard-deleted-products";

// Get locally saved products
const getLocalProducts = (): Product[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedProducts =
      localStorage.getItem(
        LOCAL_PRODUCTS_KEY
      );

    return storedProducts
      ? JSON.parse(storedProducts)
      : [];
  } catch {
    return [];
  }
};

// Save locally modified/added products
const saveLocalProducts = (
  products: Product[]
) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    LOCAL_PRODUCTS_KEY,
    JSON.stringify(products)
  );
};

// Get deleted product IDs
const getDeletedProductIds = (): number[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedIds =
      localStorage.getItem(
        DELETED_PRODUCTS_KEY
      );

    return storedIds
      ? JSON.parse(storedIds)
      : [];
  } catch {
    return [];
  }
};

// Save deleted product IDs
const saveDeletedProductIds = (
  ids: number[]
) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    DELETED_PRODUCTS_KEY,
    JSON.stringify(ids)
  );
};

// Remove duplicate local products
const removeDuplicateLocalProducts = (
  products: Product[]
): Product[] => {
  const seen = new Set<number>();

  return products.filter((product) => {
    if (seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
};

// Apply local edits/deletions
const applyLocalChanges = (
  products: Product[]
): Product[] => {
  const localProducts =
    removeDuplicateLocalProducts(
      getLocalProducts()
    );

  const deletedIds =
    getDeletedProductIds();

  return products
    .filter(
      (product) =>
        !deletedIds.includes(product.id)
    )
    .map((product) => {
      const localProduct =
        localProducts.find(
          (item) =>
            item.id === product.id
        );

      if (localProduct) {
        return {
          ...product,
          ...localProduct,
          images:
            localProduct.images ??
            product.images ??
            [],
          reviews:
            localProduct.reviews ??
            product.reviews ??
            [],
          thumbnail:
            localProduct.thumbnail ??
            product.thumbnail ??
            "",
        };
      }

      return product;
    });
};

// Get all products including local products
const getMergedProducts = (
  apiProducts: Product[]
): Product[] => {
  const localProducts =
    removeDuplicateLocalProducts(
      getLocalProducts()
    );

  const deletedIds =
    getDeletedProductIds();

  const updatedApiProducts =
    applyLocalChanges(apiProducts);

  const apiProductIds = new Set(
    apiProducts.map(
      (product) => product.id
    )
  );

  const locallyAddedProducts =
    localProducts.filter(
      (product) =>
        product.isLocal === true &&
        !apiProductIds.has(product.id) &&
        !deletedIds.includes(product.id)
    );

  return [
    ...locallyAddedProducts,
    ...updatedApiProducts,
  ];
};

// Get products
export const getProducts = async (
  limit: number,
  skip: number
): Promise<ProductsResponse> => {
  const response =
    await api.get<ProductsResponse>(
      "/products",
      {
        params: {
          limit: 194,
          skip: 0,
        },
      }
    );

  const allProducts =
    getMergedProducts(
      response.data.products
    );

  const paginatedProducts =
    allProducts.slice(
      skip,
      skip + limit
    );

  return {
    products: paginatedProducts,
    total: allProducts.length,
    skip,
    limit,
  };
};

// Search products
export const searchProducts = async (
  query: string,
  limit: number,
  skip: number
): Promise<ProductsResponse> => {
  const response =
    await api.get<ProductsResponse>(
      "/products/search",
      {
        params: {
          q: query,
          limit: 194,
          skip: 0,
        },
      }
    );

  const allProducts =
    getMergedProducts(
      response.data.products
    );

  const filteredProducts =
    allProducts.filter((product) => {
      const searchText =
        query.toLowerCase();

      return (
        product.title
          .toLowerCase()
          .includes(searchText) ||
        product.description
          .toLowerCase()
          .includes(searchText) ||
        product.category
          .toLowerCase()
          .includes(searchText)
      );
    });

  const paginatedProducts =
    filteredProducts.slice(
      skip,
      skip + limit
    );

  return {
    products: paginatedProducts,
    total: filteredProducts.length,
    skip,
    limit,
  };
};

// Get products by category
export const getProductsByCategory =
  async (
    category: string,
    limit: number,
    skip: number
  ): Promise<ProductsResponse> => {
    const response =
      await api.get<ProductsResponse>(
        `/products/category/${category}`,
        {
          params: {
            limit: 194,
            skip: 0,
          },
        }
      );

    const allProducts =
      getMergedProducts(
        response.data.products
      );

    const categoryProducts =
      allProducts.filter(
        (product) =>
          product.category === category
      );

    const paginatedProducts =
      categoryProducts.slice(
        skip,
        skip + limit
      );

    return {
      products: paginatedProducts,
      total: categoryProducts.length,
      skip,
      limit,
    };
  };

// Get categories
export const getCategories =
  async (): Promise<string[]> => {
    const response =
      await api.get<
        string[] | {
          slug: string;
          name: string;
          url: string;
        }[]
      >("/products/categories");

    return response.data.map(
      (category) => {
        if (
          typeof category ===
          "string"
        ) {
          return category;
        }

        return category.slug;
      }
    );
  };

// Get product by ID
export const getProductById =
  async (
    id: string
  ): Promise<Product> => {
    const productId =
      Number(id);

    const deletedIds =
      getDeletedProductIds();

    if (
      deletedIds.includes(productId)
    ) {
      throw new Error(
        "Product not found"
      );
    }

    const localProducts =
      removeDuplicateLocalProducts(
        getLocalProducts()
      );

    const localProduct =
      localProducts.find(
        (product) =>
          product.id === productId
      );

    // Locally added product
    if (localProduct) {
      return localProduct;
    }

    // API product
    const response =
      await api.get<Product>(
        `/products/${id}`
      );

    return response.data;
  };

// Add product
export const addProduct = async (
  product: {
    title: string;
    price: number;
    stock: number;
    category: string;
    description: string;
  }
): Promise<Product> => {
  const response =
    await api.post<Product>(
      "/products/add",
      product
    );

  const newProduct =
    response.data;

  const completeProduct: Product =
    {
      ...newProduct,

      // Create our own unique local ID
      id: Date.now(),

      title: product.title,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description:
        product.description,

      rating:
        newProduct.rating ?? 0,

      images:
        newProduct.images ?? [],

      reviews:
        newProduct.reviews ?? [],

      thumbnail:
        newProduct.thumbnail ?? "",

      // Local price is already INR
      isLocal: true,
    };

  const localProducts =
    removeDuplicateLocalProducts(
      getLocalProducts()
    );

  saveLocalProducts([
    ...localProducts,
    completeProduct,
  ]);

  return completeProduct;
};

// Update product
export const updateProduct = async (
  id: string,
  product: {
    title: string;
    price: number;
    stock: number;
    category: string;
    description: string;
  }
): Promise<Product> => {
  const originalProduct =
    await getProductById(id);

  // Only call DummyJSON for API products
  if (!originalProduct.isLocal) {
    await api.put<Product>(
      `/products/${id}`,
      product
    );
  }

  const updatedProduct: Product =
    {
      ...originalProduct,
      ...product,
      id: Number(id),

      images:
        originalProduct.images ?? [],

      reviews:
        originalProduct.reviews ?? [],

      thumbnail:
        originalProduct.thumbnail ?? "",

      rating:
        originalProduct.rating ?? 0,

      isLocal:
        originalProduct.isLocal ?? false,
    };

  const localProducts =
    removeDuplicateLocalProducts(
      getLocalProducts()
    );

  const existingIndex =
    localProducts.findIndex(
      (item) =>
        item.id === Number(id)
    );

  if (existingIndex >= 0) {
    localProducts[
      existingIndex
    ] = updatedProduct;
  } else {
    localProducts.push(
      updatedProduct
    );
  }

  saveLocalProducts(
    localProducts
  );

  return updatedProduct;
};

// Delete product
export const deleteProduct = async (
  id: string
): Promise<void> => {
  const productId =
    Number(id);

  const localProducts =
    removeDuplicateLocalProducts(
      getLocalProducts()
    );

  const localProduct =
    localProducts.find(
      (product) =>
        product.id === productId
    );

  // Locally created product
  if (localProduct?.isLocal) {
    const remainingProducts =
      localProducts.filter(
        (product) =>
          product.id !== productId
      );

    saveLocalProducts(
      remainingProducts
    );

    return;
  }

  // API product
  await api.delete(
    `/products/${id}`
  );

  const remainingProducts =
    localProducts.filter(
      (product) =>
        product.id !== productId
    );

  saveLocalProducts(
    remainingProducts
  );

  const deletedIds =
    getDeletedProductIds();

  if (
    !deletedIds.includes(
      productId
    )
  ) {
    deletedIds.push(
      productId
    );
  }

  saveDeletedProductIds(
    deletedIds
  );
};