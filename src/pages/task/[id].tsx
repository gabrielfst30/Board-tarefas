import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { db } from "@/services/firebaseConnection";
import { doc, collection, query, where, getDoc } from "firebase/firestore";
import { TextArea } from "@/components/TextArea";

interface TaskProps {
  item: {
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
}

export default function Task({ item }: TaskProps) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
            <p>{item.tarefa}</p>
        </article>
      </main>

        <section className={styles.commentsContainer}>
            <h2>Deixar comentário</h2>

            <form>
                <TextArea
                    placeholder="Digite seu comentário..."
                /> 
                <button className={styles.button}>Enviar comentário</button>              
            </form>
        </section>

    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  //referenciando oque queremos acessar no banco, no caso é o ID de tarefas
  const docRef = doc(db, "tarefas", id);

  //buscando a referenciação
  const snapshot = await getDoc(docRef);

  //verificando se existe a tarefa, se não redireciona para a tela inicial
  if (snapshot.data() === undefined) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  //se a tarefa não for pública, redireciona para tela inicial
  if (!snapshot.data()?.public) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  //pegando o milisegundos e convertendo
  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  //formatando objeto
  const task = {
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
    taskId: id,
  };

  console.log(task);

  return {
    props: {
      item: task,
    },
  };
};
