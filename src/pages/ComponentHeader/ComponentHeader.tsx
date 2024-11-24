import React, { FC } from 'react';
import styles from './ComponentHeader.module.scss';
import { IonFabButton, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { useHistory } from 'react-router';

interface ComponentHeaderProps {
  title: string,
  righCornerItem?: any
}

const ComponentHeader: FC<ComponentHeaderProps> = (props) => {
  const history = useHistory();
  return (
    <IonHeader className={ styles.ComponentHeader + ' newHeader' }>
      <IonToolbar mode='ios'>
        <IonTitle>
          <IonFabButton className='transparentButton'>
            <IonIcon icon={arrowBack} onClick={()=> history.push('/chat')}></IonIcon>
          </IonFabButton>
          <span>{props.title}</span>
          {
            props.righCornerItem ? props.righCornerItem : ''
          }
        </IonTitle>
      </IonToolbar>
    </IonHeader>
  );
}

export default ComponentHeader;
