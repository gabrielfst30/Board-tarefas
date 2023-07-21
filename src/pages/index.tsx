import Head from "next/head";
import styles from "@/styles/home.module.css";
import Image from "next/image";

import heroImg from "../../public/assets/hero.png";
import { GetStaticProps } from "next";

import { db } from "@/services/firebaseConnection";

import{
  collection,
  getDocs
} from 'firebase/firestore';

//tipando os posts e comentários recebidos pelo server side
interface HomeProps {
   posts: number;
   comments: number;
}


export default function Home({ posts, comments }: HomeProps) {
  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Tarefas+ | Organize suas tarefas de forma facil</title>
        </Head>

        <main className={styles.main}>
          <div className={styles.logoContent}>
            <Image
              className={styles.hero}
              alt="Logo Tarefas+"
              src={heroImg}
              priority
            />
          </div>
          <h1 className={styles.title}>
            Sistema feito para você organizar
            <br />
            seus estudos e tarefas.
          </h1>

          <div className={styles.infoContent}>
            <section className={styles.box}>
              <span>+{posts} posts</span>
            </section>
            <section className={styles.box}>
              <span>+{comments} comentários</span>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {

  //Buscar no banco os números do post para mandar pro component

  //Pegando referencia da tabela do banco comentários
  const commentRef = collection(db, "comments")
  //Pegando referencia da tabela do banco tarefas
  const postRef = collection(db, "tarefas")


  //Pegando os dados da tabela comments
  const commentSnapshot = await getDocs(commentRef)
  //Pegando os dados da tabela tarefas
  const postSnapshot = await getDocs(postRef)

  return {
    props: {
      posts: postSnapshot.size || 0, //traz todas as tarefas ou nenhuma tarefa
      comments: commentSnapshot.size || 0 //traz todos os comentários ou nenhum comentário
    },
    revalidate: 60 //seria revalidada a cada 60 segundos
  };
};
