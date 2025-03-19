import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const UserMobileMenu = async () => {
  const session = await auth();

  if (!session) {
    return (
      <Button asChild className="w-full justify-start mt-2">
        <Link href="/sign-in" className="flex items-center gap-2">
          <UserIcon size={24} />
          <span>Sign In</span>
        </Link>
      </Button>
    );
  }

  return (
    <div className="w-full mt-2">
      {/* User info */}
      <div className="flex flex-col py-2">
        <div className="text-sm font-medium mb-1">{session.user?.name}</div>
        <div className="text-xs text-muted-foreground">
          {session.user?.email}
        </div>
      </div>

      <Separator className="my-2" />

      {/* Links */}
      <Button asChild variant="ghost" className="w-full justify-start">
        <Link href="/user/profile">User Profile</Link>
      </Button>

      <Button asChild variant="ghost" className="w-full justify-start">
        <Link href="/user/orders">Order History</Link>
      </Button>

      {session?.user?.role === "admin" && (
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/admin/overview">Admin</Link>
        </Button>
      )}

      <Separator className="my-2" />

      {/* Sign out */}
      <form action={signOutUser} className="w-full">
        <Button className="w-full justify-start" variant="ghost">
          Sign Out
        </Button>
      </form>
    </div>
  );
};

export default UserMobileMenu;
