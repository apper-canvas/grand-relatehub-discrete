import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { useAuth } from "@/layouts/Root";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={logout}
      className="text-gray-600 hover:text-gray-800"
    >
      <ApperIcon name="LogOut" size={16} className="mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton;