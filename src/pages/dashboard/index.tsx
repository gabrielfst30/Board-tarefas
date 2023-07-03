import { GetServerSideProps } from 'next';
import { ChangeEvent, FormEvent, useState } from 'react';
import styles from './styles.module.css';
import Head from 'next/head';

//pegando a sessão do usuário
import { getSession } from 'next-auth/react';
import { TextArea } from '@/components/TextArea';
import { FiShare2 } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

export default function Dashboard() {
    //pegando um evento do input
    const [input, setInput] = useState("")
    //checkbox "deixa tarefa publica?"
    const [publicTask, setPublicTask] = useState(false)

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        console.log(event.target.checked);
        //setando o para true
        setPublicTask(event.target.checked);

    }

    function handleRegisterTask(event: FormEvent){
        event.preventDefault();

        if(input === ''){
            return;
        }

        alert("TESTE");

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
                                placeholder='Digite qual sua tarefa..'
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
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

                            <button className={styles.button} type='submit'>
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>

                    {/* TAREFA */}
                    <article className={styles.task}>
                        <div className={styles.tagContainer}>
                            <label className={styles.tag}>PÚBLICO</label>
                            <button className={styles.shareButton}>
                                <FiShare2
                                    size={22}
                                    color="#3183ff"
                                />
                            </button>
                        </div>
                        <div className={styles.taskContent}>
                            <p>Minha primeira Tarefa de exemplo!</p>
                            <button className={styles.trashButton}>
                                <FaTrash size={24} color='#ea3140' />
                            </button>
                        </div>
                    </article>
                    {/* TAREFA */}
                    <article className={styles.task}>
                        <div className={styles.tagContainer}>
                            <label className={styles.tag}>PÚBLICO</label>
                            <button className={styles.shareButton}>
                                <FiShare2
                                    size={22}
                                    color="#3183ff"
                                />
                            </button>
                        </div>

                        <div className={styles.taskContent}>
                            <p>Minha primeira Tarefa de exemplo!</p>
                            <button className={styles.trashButton}>
                                <FaTrash size={24} color='#ea3140' />
                            </button>
                        </div>
                    </article>

                </section>
            </main>
        </div>
    )
}

//server side com tipagem para melhorar a intellisense
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });
    // console.log(session);

    if (!session?.user) {
        //se não tiver sessão do usuário vamos direcionar para o home
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    return {
        props: {}
    }
}