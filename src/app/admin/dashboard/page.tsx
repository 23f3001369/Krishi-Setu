import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold font-headline mb-6">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>
            This is the AgriAssist administration panel. You can manage users, content, and system settings from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>More admin-specific content and features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
