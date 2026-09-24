import ProtectedRoute from "../../components/ProtectedRoute";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}