import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import { useState } from 'react';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link';

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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [next_page, setNext_page] =useState<string>( postsPagination.next_page)

  function handleLoadMorePosts(next_page: string){
    fetch(next_page)
    .then(res => res.json())
    .then(data => {
      const next_page= data.next_page
      
      const nextPosts =  data.results.map((post : Post) => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        })
        setNext_page(next_page)
        setPosts([...posts, ...nextPosts])
        

    })

  }

  
  return (
    <div className={styles.container}>
      <img src="/assets/Logo.svg" alt="logo" />

      <main>
        {posts.map(post => (
          <Link href={`/posts/${post.uid}`}>
          <a key={post.uid}>
            <strong>{post.data.title}</strong>
            <p>{post.data.subtitle}</p>
             <div>
            <FiCalendar />
            <time>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <FiUser />
            <span>{post.data.author}</span>
            </div>
          </a>
          </Link>
        ))}

        <button className={next_page !== null ? '' : styles.hideButton }
        onClick={()=>{handleLoadMorePosts(next_page)} }>
          Carregar mais posts
          </button>
      </main>
    </div>
    
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    pageSize: 2,
  });


  const postsPagination = {
    next_page: postsResponse.next_page,

    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };
  console.log(postsPagination);

  return {
    props: {
      postsPagination,
    },
  };
};
