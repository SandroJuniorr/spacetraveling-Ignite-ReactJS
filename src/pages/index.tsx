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

export default function Home({postsPagination}:HomeProps) {

  const posts = postsPagination.results
  console.log(posts)
  return (

    <main>
    <ul>
      {
        posts.map(post => (
          <li key={post.uid}>
            <strong>{post.data.title}</strong>
            <p>{post.data.subtitle}</p>
            <time>{post.first_publication_date}</time>
            <span>{post.data.author}</span>
          </li>)
        )
      }
    </ul>
    </main>
  )
}




export const getStaticProps: GetStaticProps  = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post',{
      pageSize: 2
    });

    console.log(JSON.stringify(postsResponse,null,2))

    const postsPagination = {
      next_page: postsResponse.next_page,
      
        results: postsResponse.results.map((post)=> {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
           data : {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author
           }
          }
        })
      }
      console.log(postsPagination)

  return (
    {
      props:{
        postsPagination,
      }
    }
  )
}
