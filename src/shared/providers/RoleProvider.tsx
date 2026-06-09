import { useRoleStore, type Role } from '@/shared/store/role-store';

export type { Role };

type RoleApi = {
  role: Role;
  setRole: (role: Role) => void;
  toggle: () => void;
  isHelper: boolean;
};

export function RoleProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useRole(): RoleApi {
  const role = useRoleStore((state) => state.role);
  const setRole = useRoleStore((state) => state.setRole);
  const toggle = useRoleStore((state) => state.toggle);
  return { role, setRole, toggle, isHelper: role === 'helper' };
}
