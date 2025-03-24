import { useState } from "react";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonInput,
  IonButton,
  IonTitle,
  IonToolbar,
  IonText,
  IonAlert,
  IonImg,
  IonCard,
  IonCardContent,
  IonIcon,
} from "@ionic/react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { locate, camera, shareSocial, thermometer } from "ionicons/icons";
import "./styles.css";

const TemperatureConverter: React.FC = () => {
  const [celsius, setCelsius] = useState<string>("");
  const [fahrenheit, setFahrenheit] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const convertTemperature = async () => {
    if (!celsius) {
      setShowAlert(true);
      return;
    }
    const celsiusValue = parseFloat(celsius);
    if (isNaN(celsiusValue)) {
      setShowAlert(true);
      return;
    }
    const fahrenheitValue = (celsiusValue * 9) / 5 + 32;
    setFahrenheit(fahrenheitValue);
    await requestPermissionAndShowNotification(fahrenheitValue);
  };

  const requestPermissionAndShowNotification = async (temperature: number) => {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display === "granted") {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Kết quả chuyển đổi",
            body: `Nhiệt độ chuyển đổi: ${temperature}°F`,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
            smallIcon: "ic_stat_icon_config_sample",
            iconColor: "#488AFF",
          },
        ],
      });
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  };

  const shareResult = async () => {
    if (fahrenheit !== null) {
      try {
        await Share.share({
          title: "Kết quả chuyển đổi nhiệt độ",
          text: `Nhiệt độ đã chuyển đổi: ${fahrenheit}°F`,
          dialogTitle: "Chia sẻ kết quả",
        });
      } catch (error) {
        console.log("Chia sẻ không thành công!", error);
      }
    }
  };

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      setPhoto(image.dataUrl!);
    } catch (error) {
      console.log("Lỗi chụp ảnh!", error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Lỗi lấy vị trí!", error);
        }
      );
    } else {
      console.log("Trình duyệt không hỗ trợ Geolocation");
    }
  };

  return (
    <IonApp>
      <IonHeader>
        <IonToolbar color="warning">
          <IonTitle className="header-title">Chuyển đổi nhiệt độ</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding app-container">
        <div className="centered-content">
          <IonCard className="input-card">
            <IonCardContent>
              <IonInput
                type="number"
                value={celsius}
                onIonChange={(e) => setCelsius(e.detail.value!)}
                placeholder="Nhập nhiệt độ (°C)"
                className="temperature-input"
              />
              <div className="button-group">
                <IonButton expand="full" color="warning" onClick={convertTemperature}>
                  <IonIcon slot="start" icon={thermometer} /> Chuyển đổi
                </IonButton>
                <IonButton expand="full" color="tertiary" onClick={shareResult}>
                  <IonIcon slot="start" icon={shareSocial} /> Chia sẻ
                </IonButton>
                <IonButton expand="full" color="success" onClick={takePhoto}>
                  <IonIcon slot="start" icon={camera} /> Chụp ảnh
                </IonButton>
              </div>

              {photo && <IonImg src={photo} alt="Ảnh chụp" className="captured-image" />}

              <IonButton expand="full" color="primary" onClick={getCurrentLocation}>
                <IonIcon slot="start" icon={locate} /> Lấy vị trí
              </IonButton>

              {location && (
                <IonText className="location-text">
                  <p>📍 Vĩ độ: {location.lat}, Kinh độ: {location.lng}</p>
                </IonText>
              )}

              {fahrenheit !== null && (
                <IonText className="temperature-text">
                  <p>🌡 Nhiệt độ: {fahrenheit}°F</p>
                </IonText>
              )}

            </IonCardContent>
          </IonCard>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Lỗi nhập liệu"
          message="Vui lòng nhập nhiệt độ hợp lệ!"
          buttons={["OK"]}
        />
      </IonContent>
    </IonApp>
  );
};

export default TemperatureConverter;
