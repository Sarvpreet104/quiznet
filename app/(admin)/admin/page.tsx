import { requireAdmin } from "@/lib/authorization";

const AdminDashboard = async () => {
  const user = await requireAdmin();

  return (
    <main>
      <h1>Admin Dashboard</h1>

      <p>
        Welcome, {user.first_name} {user.last_name}
      </p>
    </main>
  );
};

export default AdminDashboard;
