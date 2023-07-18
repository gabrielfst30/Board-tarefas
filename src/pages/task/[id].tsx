import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";

import { db } from "@/services/firebaseConnection";
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  addDoc,
  getDocs,
  deleteDoc
} from "firebase/firestore";

import { TextArea } from "@/components/TextArea";
import { FaTrash } from 'react-icons/fa'

interface TaskProps {
  item: {
    tarefa: string;
    created: string;
    public: boolean;
    user: string;
    taskId: string;
  };
  //allComments é do tipo CommentProps
  allComments: CommentProps[]
}

interface CommentProps {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: TaskProps) {
  //pegando a sessão do usuário
  const { data: session } = useSession();

  //salvando comentários
  const [input, setInput] = useState("");
  //pegando comentários passados pelo paramentro e salvando no useState
  const [comments, setComments] = useState<CommentProps[]>(allComments || []); //<- se não tiver nenhum comentário ele vai inicializar com um array vazio


  async function handleComment(event: FormEvent) {
    event.preventDefault();

    //cancela se o input tiver vazio
    if (input === "") return;

    //se o email ou o nome estiver incorreto
    if (!session?.user?.email || !session?.user?.name) return;

    //cadastrando no banco os comentários
    try {
      //criamos uma coleção "comments" para salvar os comentários
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      });

      //objeto de comentario
      const data = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      }
      //adicionando o novo comentário a lista e mantendo os velhos comentários
      setComments((oldItems) => [...oldItems, data]) 
      //depois do comentário ter enviado, o campo fica vazio.
      setInput("");
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteComment(id: string){
    try{
      //pegando a referencia do documento
      const docRef = doc(db, "comments", id);
      //deletando o documento
      await deleteDoc(docRef)

      //filtro todos os comentários que foram clicados e elimino o clicado
      const deleteComment = comments.filter((item) => item.id !== id);

      //mando o filtro para useState
      setComments(deleteComment)
    }catch(err){
      console.log(err)
    }
  }

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

        <form onSubmit={handleComment}>
          <TextArea
            value={input}
            // pegando comentario e salvando no useState
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setInput(event.target.value)
            }
            placeholder="Digite seu comentário..."
          />
          <button
            //validando se o usuário está logando, se não tiver o botão fica disabled
            disabled={!session?.user}
            className={styles.button}
          >
            Enviar comentário
          </button>
        </form>
      </section>
      <section className={styles.commentsContainer}>
            <h2>Todos comentários</h2>
            {comments.length === 0 && (
              <span>Nenhum comentário foi encontrado...</span>
            )}

            {comments.map((item) => (
              <article key={item.id} className={styles.comment}>
                <div className={styles.headComment}>
                  <label className={styles.commentsLabel}>{item.name}</label>
                  {/* se o usuário estiver deslogado, o botão de excluir não aparece */}
                {item.user === session?.user?.email && (
                    <button className={styles.buttonTrash}>
                    <FaTrash size={18} color="#EA3140" onClick={ () => handleDeleteComment(item.id)}/>
                  </button>
                )}
                </div>
                <p>{item.comment}</p>
              </article>
            ))}
      </section>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id as string;

  //referenciando oque queremos acessar no banco, no caso é o ID de tarefas
  const docRef = doc(db, "tarefas", id);

  //Acessando os comentários de todas as tarefas do id
  const q = query(collection(db, "comments"), where("taskId", "==", id));
  //puxando os comentários em tempo real
  const snapshotComments = await getDocs(q);

  //tipando e dizendo que é array
  let allComments: CommentProps[] = [];

  //procurando dentro de cada doc
  snapshotComments.forEach((doc) => {
    //puxando os dados para nosso array
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  });

  console.log(allComments)

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

  return {
    props: {
      item: task,
      allComments: allComments //enviando para nosso component
    },
  };
};
