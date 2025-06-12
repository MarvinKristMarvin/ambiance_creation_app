import { useGlobalStore } from "@/stores/useGlobalStore";
import { ToastType, ToastIcon } from "@/types";

export const useShowToast = () => {
  const showToast = useGlobalStore((state) => state.showToast);

  /**
   * Show a toast notification
   * @param type - Toast type (success, warning, error, info)
   * @param icon - Icon type (star, note, ghost, check, warning, error, info)
   * @param message - Message to display
   * @param duration - Duration in milliseconds (default: 3000)
   */
  const ShowToast = (
    type: ToastType,
    icon: ToastIcon,
    message: string,
    duration?: number
  ) => {
    showToast(type, icon, message, duration);
  };

  return { ShowToast };
};
