export interface EnvAccountConfig {
  username: string;
  password: string;
  name: string;
}

export const getEnvAuthConfig = (): { admin: EnvAccountConfig; staff: EnvAccountConfig } => {
  const adminUsername = (import.meta.env.VITE_ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  const adminName = import.meta.env.VITE_ADMIN_NAME || 'Administrator Lab';

  const staffUsername = (import.meta.env.VITE_STAFF_USERNAME || 'staff').trim().toLowerCase();
  const staffPassword = import.meta.env.VITE_STAFF_PASSWORD || 'staff123';
  const staffName = import.meta.env.VITE_STAFF_NAME || 'Budi Santoso';

  return {
    admin: {
      username: adminUsername,
      password: adminPassword,
      name: adminName,
    },
    staff: {
      username: staffUsername,
      password: staffPassword,
      name: staffName,
    },
  };
};

