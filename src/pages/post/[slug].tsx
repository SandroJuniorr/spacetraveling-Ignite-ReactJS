import { GetStaticPaths, GetStaticProps } from 'next';
import PrismicDOM from 'prismic-dom'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';
import Header from '../../components/Header';
import { FiCalendar, FiUser,FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router'

interface Content {
  heading: string;
  body: [];
}
interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()
  const contentWords = post.data.content.reduce((acc, prev)=>{
   const wordsbody = PrismicDOM.RichText.asText(prev.body).split(' ')
   const wordsHeading = prev.heading ? prev.heading.split(' ') : []
   const allWords = [...wordsHeading , ...wordsbody]
    return acc + allWords.length
  },0)

  const readingTime = `${Math.ceil(contentWords / 200) } min`

   



if (router.isFallback) {
  return <div>Carregando...</div>
}
  
  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <div className={ styles.container}>
        <img src={post.data.banner.url} alt="banner" />
        <main className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.infoPost}>
            <FiCalendar />
            <time>
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <span>{readingTime}</span>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(contentData => {
              return (
                <div key={contentData.heading}>
                  <h2> {contentData.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asText(contentData.body) }}
                  />
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  return {
    paths: posts.results.map(post => {
        return (
          {params: 
            {
              slug: post.uid
            }
          }
          
        )
      })  
     
    ,
    fallback: true,
  };
  
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});

  const { slug } = params;
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map((content: Content) => {
        return {
          heading: content.heading,
          body: content.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30 //30 min
  };
};
