import { IonCol, IonFabButton, IonIcon, IonRow, IonText } from '@ionic/react';
import { cameraOutline, closeOutline } from 'ionicons/icons';
import {  FC, useEffect, useState } from 'react';
import styles from './ComponentUpload.module.scss';

export type fileInput = {
  id?: string | null,
  position?: number | null,
  key?: string | null,
  file_type?: string | null,
};

interface ComponentUploadProps {
  inputFileClick?: any // use to click on upload
  mediaData?: [ fileInput ],
  filePath?: string,
  productVariantId?: string,
  onMediaDataAdd: (e:any)=> void,
  acceptFileType?: string,
  children?: React.ReactNode; // Include 'children' if needed
  feedId?: string
  type?: string
}

const ComponentUpload: FC<ComponentUploadProps> = (props) => {
  const [ mediaData, setMediaData ] = useState([] as any[]);
  const maxSize = 5; // size in mb
  useEffect(()=> {
    if (props.inputFileClick) {
      setTimeout(() => {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
          fileInput.click()
        }
      }, 100);
    }
    if (props.mediaData && props.mediaData.length ) {
      setMediaData(props.mediaData)
    }

  }, [ props.mediaData, props.filePath ]);

  /**
   * imageUpload
   */
  async function imageUpload(event:any) {
    try {
      const mediaTemp = [ ...mediaData ];
      for (const file of event.target.files) {
        if (maxSize && (file.size / 1024 / 1024) > maxSize) {
          return;
        }

        mediaTemp.push(file);

        props.onMediaDataAdd(mediaTemp);
      }
      setMediaData(mediaTemp);

    }
    catch (error:any) {
      console.log('Exception in imageUpload', error);
    }
  }
  /**
   * generateUniqueFilename
   * @param originalFilename
   * @returns
   */
  function generateUniqueFilename(originalFilename: string) {
    // Extract the file extension
    const fileExtension = originalFilename.split('.').pop();

    // Generate a random string
    const randomString = Math.random().toString(36).substring(2, 8);

    // Get the current timestamp
    const timestamp = new Date().getTime();

    // Combine all the parts to form the unique filename
    const uniqueFilename = `${timestamp}_${randomString}.${fileExtension}`;

    return uniqueFilename;
  }
  /**
   * deleteFile
   */
  async function deleteFile(key:string, index: number, mediaId?: string) {
    try {
      let mediaTemp = [ ...mediaData ];
      mediaTemp = mediaTemp.splice(index, 1);
      setMediaData(mediaTemp);
    }
    catch (error) {
      console.error('Exception in deleteFile()', error);
    }
  }

  return (
    <div className={styles.ComponentUpload} data-testid="ComponentUpload">
      <IonRow className={styles.mediaClass} key={mediaData.length}>
        <IonCol size='4' style={{ height: '120px' }}>
          <div className={styles.addimage}>
            {
              props.acceptFileType ?
                <input type="file" accept={props.acceptFileType} className={styles.fileInput} multiple onChange={imageUpload} id="fileInput" />
                :
                <input type="file" accept='image/*' className={styles.fileInput} multiple onChange={imageUpload} id="fileInput" />
            }
            <div className={styles.addimageCard}>
              <div>
                <IonFabButton className='primaryBtn'>
                  <IonIcon icon={cameraOutline}></IonIcon>
                </IonFabButton>
                <p>Add your photos</p>
              </div>
            </div>
            {/* <img src="/assets/icon/addimage.png" className={styles.addimage} alt="profilepic" /> */}
          </div>
        </IonCol>
        {
          mediaData.map((ele, index) =>
            <IonCol size='4' className={styles.mediaSection} key={index}>
              <div className={styles.imageassets}>
                <img src={URL.createObjectURL(ele)}
                  alt="ProfilePic" />
              </div>
              <IonText className={styles.filenameText}>{ele.key}</IonText>
              <span className={styles.deleteClass} onClick={(e)=> deleteFile(ele.key, index, ele.id)}>
                <IonIcon icon={closeOutline}></IonIcon>
              </span>
            </IonCol>
          )
        }
      </IonRow>
    </div>
  );
};

export default ComponentUpload;
