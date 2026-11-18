import { GetServerSidePropsContext } from 'next';
import { getUserFromRequest } from '@/utils/auth';

export default function Home() {
  return null;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const user = getUserFromRequest(context.req as never);
  return {
    redirect: {
      destination: user ? '/dashboard.html' : '/login.html',
      permanent: false,
    },
  };
}
