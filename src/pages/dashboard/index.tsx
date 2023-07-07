import { GetServerSideProps } from "next";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import styles from "./styles.module.css";
import Head from "next/head";

//pegando a sessão do usuário
import { getSession } from "next-auth/react";
import { TextArea } from "@/components/TextArea";
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

//importando a conexão com o db do firebase
import { db } from "@/services/firebaseConnection";

//metodos do firestore
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import Link from "next/link";

//Tipagem dos dados do usuário
interface HomeProps {
  user: {
    email: string;
  };
}

//Tipagem dos objetos das tarefas
interface TaskProps {
  id: string;
  created: Date;
  public: boolean;
  tarefa: string;
  user: string;
}

export default function Dashboard({ user }: HomeProps) {
  //pegando um evento do input
  const [input, setInput] = useState("");
  //checkbox "deixa tarefa publica?"
  const [publicTask, setPublicTask] = useState(false);
  //criando um estado para armazenar nossa lista de items
  const [tasks, setTasks] = useState<TaskProps[]>([]);

  //useEffect para carregar tarefas por usuário
  useEffect(() => {
    async function loadTarefas() {
      //pegando a referencia do banco
      const tarefasRef = collection(db, "tarefas");

      //filtrando a busca de tarefas por um unico usuário no banco
      const q = query(
        tarefasRef,
        orderBy("created", "desc"),
        //pesquisando tarefas onde o user é igual ao user logado
        where("user", "==", user?.email)
      );

      //buscando os dados em tempo real com o snapshot
      //muda os dados em tempo real, top demais
      onSnapshot(q, (snapshot) => {
        //criando uma lista do tipo TaskProps
        let lista = [] as TaskProps[];

        //percorrendo a lista e adicionando os dados
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id, //id da tarefa
            tarefa: doc.data().tarefa, //conteúdo da tarefa
            created: doc.data().created, //data de criação
            user: doc.data().user, //nome do usuario
            public: doc.data().public, //se a tarefa é pública ou não
          });
        });

        console.log(lista);
        //Armazenando a lista de tarefas no noss useState
        setTasks(lista);
      });
    }

    loadTarefas();
  }, [user?.email]); //passando a propriedade como array de dependencia do useEffect

  function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.checked);
    //setando o para true
    setPublicTask(event.target.checked);
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault();

    if (input === "") {
      return;
    }

    try {
      //addDoc 'tarefas' em uma collection
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        created: new Date(),
        user: user?.email,
        public: publicTask,
      });

      //Limpando o input e removendo o checkbox após registro de tarefa
      setInput("");
      setPublicTask(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_URL}/task/${id}`
    );

    alert("URL copiada com sucesso!");
  }

  async function handleDeleteTask(id: string) {
    //pegando a referencia do doc pelo id que será excluido
    const docRef = doc(db, "tarefas", id);
    //excluindo documento
    await deleteDoc(docRef);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>
      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.contentForm}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>
            <form onSubmit={handleRegisterTask}>
              <TextArea
                placeholder="Digite qual sua tarefa.."
                value={input}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setInput(event.target.value)
                }
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label>Deixar tarefa pública?</label>
              </div>

              <button className={styles.button} type="submit">
                Registrar
              </button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas tarefas</h1>
          {/* PASSANDO AS TAREFAS PARA O USUÁRIO */}
          {/* A PRIMEIRA DIV SEMPRE VAI CONTER A KEY */}
          {tasks.map((item) => (
            <article key={item.id} className={styles.task}>
              {/* CONDIÇÃO PARA FAZER APARECER A DIV SOMENTE SE PUBLIC FOR TRUE */}
              {item.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PÚBLICO</label>
                  <button
                    className={styles.shareButton}
                    onClick={() => handleShare(item.id)}
                  >
                    <FiShare2 size={22} color="#3183ff" />
                  </button>
                </div>
              )}

              <div className={styles.taskContent}>
                {/* INSERINDO O O CONTEÚDO DA TAREFA QUE PUXAMOS DO FIREBASE */}

                {/* SE A TAREFA FOR PUBLICA NOS MANDA PARA OUTRA PAGINA, SE NÃO CONTINUA */}
                {item.public ? (
                  <Link href={`/task/${item.id}`}>
                    <p>{item.tarefa}</p>
                  </Link>
                ) : (
                  <p>{item.tarefa}</p>
                )}

                <button
                  className={styles.trashButton}
                  onClick={() => handleDeleteTask(item.id)}
                >
                  <FaTrash size={24} color="#ea3140" />
                </button>
              </div>
            </article>
          ))}
          ;
        </section>
      </main>
    </div>
  );
}

//server side com tipagem para melhorar a intellisense
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });
  // console.log(session);

  if (!session?.user) {
    //se não tiver sessão do usuário vamos direcionar para o home
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: {
        //retornando o email do usuário que esta com a sessão
        email: session?.user?.email,
      },
    },
  };
};
