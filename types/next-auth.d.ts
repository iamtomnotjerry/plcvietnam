import type { DefaultSession } from 'next-auth';
import type { MockUserRole } from '@/lib/auth/mockUserStore';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: MockUserRole;
    };
  }

  interface User {
    id: string;
    role?: MockUserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: MockUserRole;
  }
}
