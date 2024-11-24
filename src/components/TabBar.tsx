import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import { documentText, images } from "ionicons/icons";
import styles from "./TabBar.module.scss";

const AnimatedTabBar = ({ activeTab, setActiveTab }: any) => {
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabWrapper}>
        {/* Background Indicator */}
        <div className={`${styles.backgroundIndicator} ${styles[activeTab]}`} />

        {/* Documents Tab */}
        <button
          onClick={() => setActiveTab("documents")}
          className={`${styles.tab} ${
            activeTab === "documents" ? styles.active : ""
          }`}
        >
          {/* <IonIcon icon={images} className={styles.icon} /> */}
          <span className={styles.label}>Actions</span>
        </button>

        {/* Gallery Tab */}
        <button
          onClick={() => setActiveTab("gallery")}
          className={`${styles.tab} ${
            activeTab === "gallery" ? styles.active : ""
          }`}
        >
          <IonIcon icon={documentText} className={styles.icon} />
          <span className={styles.label}>History</span>
        </button>
      </div>
    </div>
  );
};

export default AnimatedTabBar;
