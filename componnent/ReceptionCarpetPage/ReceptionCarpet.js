import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  ImageBackground,
  ScrollView,
  Text,
  View,
  Modal,
} from "react-native";
import TextInputCustom from "../../shared/TextInputCustom";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../api/api";
import styles from "./ReceptionCarpetStyles";
import { UserContext } from "../../shared/UserContext";

const ReceptionCarpet = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const [numberOfCarpet, setNumberOfCarpet] = useState("");
  const [numberOfTracks, setNumberOfTracks] = useState("");
  const [note, setNote] = useState("");

  const [savedName, setSavedname] = useState("");
  const [savedSurname, setSavedsurname] = useState("");
  const [savedAddress, setSavedaddress] = useState("");
  const [savedPhone, setSavedphone] = useState("");
  const [savedNumberOfCarpet, setSavedNumberOfCarpet] = useState("");
  const [savedNumberOfTracks, setSavedNumberOfTracks] = useState("");
  const [savedNote, setSavedNote] = useState("");

  const [carpetReception, setCarpetReceptionId] = useState(0);

  const [lastVisitDate, setLastVisitDate] = useState();
  const [lastVisitNumberOfCarpet, setLastVisitNumberOfCarpet] = useState("");
  const [lastVisitNumberOfTracks, setLastVisitNumberOfTracks] = useState("");

  const [penultimateVisitDate, setPenultimateVisitDate] = useState();
  const [penultimateVisitNumberOfCarpet, setPenultimateVisitNumberOfCarpet] =
    useState("");
  const [penultimateVisitNumberOfTracks, setPenultimateVisitNumberOfTracks] =
    useState("");

  const [thirdVisitDate, setThirdVisitDate] = useState("");
  const [thirdVisitNumberOfCarpet, setThirdVisitNumberOfCarpet] = useState("");
  const [thirdVisitNumberOfTracks, setThirdVisitNumberOfTracks] = useState("");

  const [display, setDisplay] = useState(false);

  const [editName, setEditName] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNumberOfCarpet, setEditNumberOfCarpet] = useState("");
  const [editNumberOfTracks, setEditNumberOfTracks] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(async () => {
    if ((await AsyncStorage.getItem("@api_tokenuser")) === null)
      return navigation.navigate("LOG IN");
    if (user.workerId === null) return navigation.navigate("WorkerLogIn");

    api(
      `api/carpetReception/getBigistReceptionByUser/${user.userId}`,
      "post",
      {},
      "user"
    )
      .then(async (res) => {
        if (res.data.length !== 0) {
          await AsyncStorage.setItem(
            "@reception_user",
            JSON.stringify(res.data[0].carpetReceptionUser + 1)
          );
          return;
        }
        await AsyncStorage.setItem("@reception_user", "1");
      })
      .catch((error) => console.log(error));

    return () => {};
  }, []);

  async function sendData() {
    if (name === "" || surname === "" || address === "") {
      return;
    }
    await api(
      `api/clients/addClient/${user.userId}`,
      "post",

      {
        name: name,
        surname: surname,
        address: address,
        phone: phone,
      },
      "user"
    )
      .then(async (res) => {
        setSavedname(res.data.name);
        setSavedsurname(res.data.surname);
        setSavedaddress(res.data.address);
        setSavedphone(res.data.phone);
        await api(
          `api/carpetReception/addReception/${user.workerId}`,
          "post",

          {
            clientsId: res.data.clientsId,
            numberOfCarpet: Number(numberOfCarpet),
            numberOfTracks: Number(numberOfTracks),
            note: note,
            carpet_reception_user: await AsyncStorage.getItem(
              "@reception_user"
            ),
            userId: user.userId,
          },
          "user"
        )
          .then(async (res) => {
            const receptions = res.data.carpetReceptions;
            setCarpetReceptionId(await AsyncStorage.getItem("@reception_user"));

            receptions
              .slice(Math.max(res.data.length - 4, 0))
              .reverse()
              .forEach((item, index) => {
                if (index === 0) {
                  setSavedNumberOfCarpet(item.numberOfCarpet);
                  setSavedNumberOfTracks(item.numberOfTracks);
                }
                if (index === 1) {
                  setLastVisitDate(item.timeAt.split("T")[0]);
                  setLastVisitNumberOfCarpet(item.numberOfCarpet);
                  setLastVisitNumberOfTracks(item.numberOfTracks);
                }
                if (index === 2) {
                  setPenultimateVisitDate(item.timeAt.split("T")[0]);
                  setPenultimateVisitNumberOfCarpet(item.numberOfCarpet);
                  setPenultimateVisitNumberOfTracks(item.numberOfTracks);
                }
                if (index === 3) {
                  setThirdVisitDate(item.timeAt.split("T")[0]);
                  setThirdVisitNumberOfCarpet(item.numberOfCarpet);
                  setThirdVisitNumberOfTracks(item.numberOfTracks);
                }
              });

            setName("");
            setSurname("");
            setAddress("");
            setPhone("");
            setNumberOfCarpet("");
            setNumberOfTracks("");
            setNote("");
            const receptionId = Number(
              await AsyncStorage.getItem("@reception_user")
            );
            await AsyncStorage.setItem(
              "@reception_user",
              JSON.stringify(receptionId + 1)
            );
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async function sendEditData() {
    api(
      `api/clients/getClientByNameSurnameAddress/${user.userId}`,
      "post",
      {
        name: savedName,
        surname: savedSurname,
        address: savedAddress,
      },
      "user"
    )
      .then((res) => {
        api(
          `api/clients/editClient/${res.data.clientsId}`,
          "post",
          {
            name: editName,
            surname: editSurname,
            address: editAddress,
            phone: editPhone,
          },
          "user"
        )
          .then((res) => {
            setSavedname(res.data.name);
            setSavedsurname(res.data.surname);
            setSavedaddress(res.data.address);
            setSavedphone(res.data.phone);
            api(
              `api/carpetReception/editReception/${user.workerId}/${user.userId}`,
              "post",
              {
                carpetReceptionId: carpetReception,
                numberOfCarpet: editNumberOfCarpet,
                numberOfTracks: editNumberOfTracks,
                note: editNote,
              },
              "user"
            ).then((res) => {
              setSavedNumberOfCarpet(res.data.numberOfCarpet);
              setSavedNumberOfTracks(res.data.numberOfTracks);
              setSavedNote(res.data.note);
              setDisplay(false);
            });
          })
          .catch((error) => console.log(error.data));
      })
      .catch((error) => console.log(error.data));
  }

  function logOutWorker() {
    setUser({
      ...user,
      workerId: null,
      workerName: "",
      workerLogIn: false,
    });
  }

  return (
    <ImageBackground
      style={styles.background}
      source={require("../../assets/hero-bg.jpg")}
    >
      <View style={styles.darkTheme}>
        <View style={styles.header}>
          <View style={styles.text}>
            <Text style={styles.text}>Korisnik: </Text>
            <Text style={styles.textDinamic}>{user.userName}</Text>
          </View>
          <View>
            <Text style={styles.text}>Radnik: </Text>
            <Text style={styles.textDinamic}>{user.workerName} </Text>
          </View>
          <View>
            <Button
              title="Odjava Radnika"
              color={"#fec400"}
              onPress={() => logOutWorker()}
            />
          </View>
        </View>
        <ScrollView>
          <View style={styles.container}>
            <View>
              <View>
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 30,
                    fontWeight: "bold",
                    marginVertical: 20,
                    marginLeft: 10,
                  }}
                >
                  Prijem tepiha
                </Text>
              </View>
              <View style={styles.clientHolder}>
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 25,
                    fontStyle: "italic",
                  }}
                >
                  Podaci o klijentu
                </Text>
                <TextInputCustom
                  text="Ime:"
                  name="file-signature"
                  size={30}
                  color="#fec400"
                  value={name}
                  changeText={setName}
                />
                <TextInputCustom
                  text="Prezime:"
                  name="file-signature"
                  size={30}
                  color="#fec400"
                  value={surname}
                  changeText={setSurname}
                />
                <TextInputCustom
                  text="Adresa:"
                  name="address-card"
                  size={30}
                  color="#fec400"
                  value={address}
                  changeText={setAddress}
                />
                <TextInputCustom
                  text="Telefon:"
                  name="phone"
                  size={30}
                  color="#fec400"
                  value={phone}
                  changeText={setPhone}
                  keyboard="number-pad"
                />
              </View>
            </View>
            <View>
              <View style={styles.clientHolder}>
                <Text
                  style={{
                    color: "#eee",
                    fontSize: 25,
                    fontStyle: "italic",
                    marginVertical: 10,
                  }}
                >
                  Popis tepiha
                </Text>
                <TextInputCustom
                  text="Broj tepiha:"
                  name="list-ol"
                  size={30}
                  color="#fec400"
                  value={numberOfCarpet}
                  changeText={setNumberOfCarpet}
                  keyboard="number-pad"
                />
                <TextInputCustom
                  text="Broj staza:"
                  name="list-ol"
                  size={30}
                  color="#fec400"
                  value={numberOfTracks}
                  changeText={setNumberOfTracks}
                  keyboard="number-pad"
                />
                <View style={{ marginVertical: 20, width: "50%" }}>
                  <Button
                    title="Posalji..."
                    color={"#793ea5"}
                    onPress={() => sendData()}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.containerSavedData}>
            <View>
              <Text
                style={{
                  color: "#ccc",
                  fontSize: 25,
                  textAlign: "center",
                  fontWeight: "bold",
                  marginBottom: 20,
                }}
              >
                ID broj klijenta je:
                <Text style={{ color: "#fec400" }}>{carpetReception}</Text>
              </Text>
            </View>

            <View>
              <Text style={styles.IDtekst}>Ime: {savedName}</Text>
              <Text style={styles.IDtekst}>Prezime:{savedSurname}</Text>
              <Text style={styles.IDtekst}>Adresa:{savedAddress}</Text>
              <Text style={styles.IDtekst}>Telefon:{savedPhone}</Text>
              <Text style={styles.IDtekst}>
                Broj tepiha:{savedNumberOfCarpet}
              </Text>
              <Text
                style={{
                  color: "#ccc",
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 40,
                }}
              >
                Broj staza:{savedNumberOfTracks}
              </Text>
            </View>

            <View
              style={{
                borderColor: "#fec400",
                borderWidth: 1,
                borderRadius: 20,
                marginBottom: 20,
              }}
            >
              <Button
                title="Izmenite podatke..."
                color={"transparent"}
                onPress={() => setDisplay(true)}
              />
            </View>

            <View style={styles.visitContainer}>
              <View>
                <Text style={{ color: "#eee", fontSize: 20, marginBottom: 10 }}>
                  Posete klijenta nasem servisu:
                </Text>
              </View>
              <View style={styles.visitInfo}>
                <Text style={{ color: "#eee" }}>Datum:{lastVisitDate}</Text>
                <Text style={{ color: "#eee" }}>
                  Broj tepiha:{lastVisitNumberOfCarpet}
                </Text>
                <Text style={{ color: "#eee" }}>
                  Broj staza:{lastVisitNumberOfTracks}
                </Text>
              </View>
              <View style={styles.visitInfo}>
                <Text style={{ color: "#eee" }}>
                  Datum:{penultimateVisitDate}
                </Text>
                <Text style={{ color: "#eee" }}>
                  Broj tepiha:{penultimateVisitNumberOfCarpet}
                </Text>
                <Text style={{ color: "#eee" }}>
                  Broj staza:{penultimateVisitNumberOfTracks}
                </Text>
              </View>
              <View style={styles.visitInfo}>
                <Text style={{ color: "#eee" }}>Datum:{thirdVisitDate}</Text>
                <Text style={{ color: "#eee" }}>
                  Broj tepiha:{thirdVisitNumberOfCarpet}
                </Text>
                <Text style={{ color: "#eee" }}>
                  Broj staza:{thirdVisitNumberOfTracks}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <Modal visible={display} animationType="slide">
          <ImageBackground
            style={styles.background}
            source={require("../../assets/hero-bg.jpg")}
          >
            <ScrollView>
              <View style={styles.container}>
                <View>
                  <View>
                    <Text
                      style={{
                        color: "#fec400",
                        fontSize: 30,
                        fontWeight: "bold",
                        marginVertical: 20,
                        marginLeft: 10,
                      }}
                    >
                      Izmena podataka
                    </Text>
                  </View>
                  <View style={styles.clientHolder}>
                    <Text
                      style={{
                        color: "#fec400",
                        fontSize: 25,
                        fontStyle: "italic",
                      }}
                    >
                      Podaci o klijentu
                    </Text>
                    <TextInputCustom
                      text="Ime:"
                      name="file-signature"
                      size={30}
                      color="#fec400"
                      value={editName}
                      changeText={setEditName}
                    />
                    <TextInputCustom
                      text="Prezime:"
                      name="file-signature"
                      size={30}
                      color="#fec400"
                      value={editSurname}
                      changeText={setEditSurname}
                    />
                    <TextInputCustom
                      text="Adresa:"
                      name="address-card"
                      size={30}
                      color="#fec400"
                      value={editAddress}
                      changeText={setEditAddress}
                    />
                    <TextInputCustom
                      text="Telefon:"
                      name="phone"
                      size={30}
                      color="#fec400"
                      value={editPhone}
                      changeText={setEditPhone}
                      keyboard="number-pad"
                    />
                  </View>
                </View>
                <View>
                  <View style={styles.clientHolder}>
                    <Text
                      style={{
                        color: "#fec400",
                        fontSize: 25,
                        fontStyle: "italic",
                        marginVertical: 10,
                      }}
                    >
                      Popis tepiha
                    </Text>
                    <TextInputCustom
                      text="Broj tepiha:"
                      name="list-ol"
                      size={30}
                      color="#fec400"
                      value={editNumberOfCarpet}
                      changeText={setEditNumberOfCarpet}
                      keyboard="number-pad"
                    />
                    <TextInputCustom
                      text="Broj staza:"
                      name="list-ol"
                      size={30}
                      color="#fec400"
                      value={editNumberOfTracks}
                      changeText={setEditNumberOfTracks}
                      keyboard="number-pad"
                    />
                    <View style={{ marginVertical: 20, width: "50%" }}>
                      <Button
                        title="Posalji..."
                        color={"#793ea5"}
                        onPress={() => sendEditData()}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
          </ImageBackground>
        </Modal>
      </View>
    </ImageBackground>
  );
};

export default ReceptionCarpet;
