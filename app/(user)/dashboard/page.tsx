import { requireStudent } from "@/lib/authorization";

const Dashboard = async () => {
  const user = await requireStudent();

  return (
    <main>
      <h1>Student Dashboard</h1>

      <p>
        Welcome, {user.first_name} {user.last_name}
      </p>
    </main>
  );
};

export default Dashboard;
