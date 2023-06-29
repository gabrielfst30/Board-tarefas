import { HTMLProps } from 'react';
import styles from './styles.module.css';

//com o rest eu pego as propriedades de um evento HTML de outra pagina deixando um component dinamico de acordo com minha necessidade
export function TextArea({ ...rest }: HTMLProps<HTMLTextAreaElement>){
    return <textarea className={styles.textarea} {...rest}></textarea>;
}