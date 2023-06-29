//PADROES DA BIBLIOTECA NEXT-AUTH
import { useSession, signIn, signOut } from 'next-auth/react';

import styles from './styles.module.css'
import Link from 'next/link';

export default function Header(){

    //CRIANDO USESTATE PARA MANIPULAR SESSAO DO USUARIO
    const { data: session, status } = useSession();

    return(
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>
                    <Link href="/">
                        <h1 className={styles.logo}>
                            Tarefas<span>+</span>
                        </h1>
                    </Link>
                    {/* so aparece o botao se o usuario estiver logado */}
                    {session?.user && (
                        <Link href="/dashboard" className={styles.link}>
                            Meu Painel
                        </Link>
                    )}
                </nav>
                {/* carregando... */}
                { status === "loading" ? (
                    <></>
                // se o usuario tiver session (ao clicar o botao desloga)
                ) : session? (
                    <button className={styles.loginButton} onClick={ () => signOut()}>
                        {/*pegando o nome do usuario do google */}
                         Olá {session?.user?.name} 
                    </button>
                ) : (
                    // se nao tiver session (ao clicar o botao loga)
                    <button className={styles.loginButton} onClick={ () => signIn("google")}>
                        Acessar
                    </button>
                )}
            </section>
        </header>
    );
}