import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({oi}) {
  return <h1>{oi}</h1>
}

export const getStaticProps: GetStaticProps  = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post',{
    pageSize: 2
  });

  console.log(postsResponse)

  return ({
    props:{
      oi:"teste"
    }}
  )
};
