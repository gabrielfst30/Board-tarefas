import { GetServerSideProps } from 'next';
import styles from './styles.module.css';
import Head from 'next/head';

//pegando a sessão do usuário
import { getSession } from 'next-auth/react';
import { TextArea } from '@/components/TextArea';

export default function Dashboard(){
    return(
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual sua tarefa?</h1>
                        <form>
                            <TextArea
                                placeholder='Digite qual sua tarefa..'
                            />
                            <div className={styles.checkboxArea}>
                                <input type="checkbox" className={styles.checkbox}/>
                                <label>Deixar tarefa pública?</label>    
                            </div>

                            <button className={styles.button} type='submit'>
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    )
}

//server side com tipagem para melhorar a intellisense
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });
   // console.log(session);

   if(!session?.user){
    //se não tiver sessão do usuário vamos direcionar para o home
        return{
            redirect:{
                destination:'/',
                permanent: false,
            }
        }
   }
    
    return {
        props:{}
    }
}