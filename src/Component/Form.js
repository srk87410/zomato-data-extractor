/* eslint-disable */
import React, { useEffect, useState } from "react";
import "./Form.css";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Modal,
  Typography,
  Row,
  Col,
  Divider,
  List,
  Alert,
  Tabs,
  Space,
  Tag,
  ConfigProvider,
  Carousel,
  Spin,
  message,
  Flex,
  Avatar,
} from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  HomeOutlined,
  KeyOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import countryList from "../countryList.json";
import langList from "../lang.json";
import logo from "../images/logo.png";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

const FormComponent = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();

  const [rData, setRData] = useState({});
  const [theme, setTheme] = useState({ primaryColor: "#0855a4" });
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [setting, setSetting] = useState(null);
  const [licenseDetails, setLicenseDetails] = useState(null);
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  const [licenseMessage, setLicenseMessage] = useState("");
  const [scrapData, setScrapData] = useState({});
  const [selectedKeywordId, setSelectedKeywordId] = useState("select");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [country, setCountry] = useState("IN");
  const [city, setCity] = useState("");
  const [key, setKey] = useState("");
  const [keyIsValid, setKeyIsValid] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState("home");
  const [delay, setDelay] = useState(1);
  const [selectLang, setSelectLang] = useState("en");
  const [dataFormate, setDataFormate] = useState("csv");
  const [removeDuplicate, setRemoveDuplicate] = useState("only_phone");
  const [columns, setColumns] = useState([]);
  const [extractCol, setExtractCol] = useState({});
  const [zomatoLink, setZomatoLink] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const [licenceKeyErrorMessage, setLicenceKeyErrorMessage] = useState(
    t("invalidLicenseKey")
  );
  const [renewKey, setRenewKey] = useState("");
  const [renewOpen, setRenewOpen] = useState(false);
  const [localmanifestVersion, setLocalmanifestVersion] = useState("");
  const [isUpdate, setIsUpdate] = useState(true);
  const [activeStep, setActiveStep] = useState(0);

  const TAB_ITEMS = ["home", "data", "setting", "help"];

  const isEmailIsValid = (emailAddress) => {
    let regex = new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}");
    return regex.test(emailAddress);
  };

  const sendChromeMessage = (data, callback) => {
    try {
      chrome.runtime.sendMessage(data, (response) => {
        callback(response);
      });
    } catch (e) {
      console.log("sendMessage Error:", e);
      callback({ status: false, message: "Something is wrong" });
    }
  };

  useEffect(() => {
    getResellerData();
    getColumns();
    getSetting();
    getProductData();
    getLicenseDetails();
    getVersion();
    getScrapeData();
  }, []);

  useEffect(() => {
    let color = "#0855a4";
    if (product) color = product.color;
    if (rData.theme_setting && rData.theme_setting["primary-color"]) {
      color = rData.theme_setting["primary-color"];
    }
    setTheme({ primaryColor: color });
  }, [product, rData]);

  useEffect(() => {
    if (showValidation) setTimeout(() => setShowValidation(false), 2000);
  }, [showValidation]);

  useEffect(() => {
    checkLicense(key);
  }, [key]);

  const checkLicense = (key) => {
    if (key.length === 19) {
      sendChromeMessage(
        { license_key: key, type: "license_verify" },
        (response) => {
          setKeyIsValid(response.status);
          setLicenceKeyErrorMessage(response.message);
        }
      );
    } else {
      setKeyIsValid(false);
      setLicenceKeyErrorMessage(t("invalidLicenseKey"));
    }
  };

  const getProductData = () =>
    sendChromeMessage(
      { type: "get_product" },
      (response) => response.status && setProduct(response.product)
    );
  const getColumns = () =>
    sendChromeMessage({ type: "columns" }, (response) => {
      setColumns(response.columns);
      response.columns.forEach((x) =>
        setExtractCol((col) => ({ ...col, [x.value]: true }))
      );
    });
  // const getResellerData = () =>
  //   sendChromeMessage({ type: "get_data" }, (response) => {
  //     if (response.status) {
  //       setRData(response.data);
  //       setPhone("+" + response.data.country_code);
  //       const c = countryList.find(
  //         (c) => c.countryCode === (response.data.country ?? "IN")
  //       );
  //       if (c) setCountry(c.countryNameEn);
  //     }
  //   });

  const getResellerData = () => {
    sendChromeMessage({ type: "get_data" }, (response) => {
      if (response.status) {
        console.log("response getResellerData", response);

        setRData(response.data);
        setPhone("+" + response.data.country_code);
        setCountry(response.data.country);
      }
    });
  };
  const getScrapeData = () =>
    sendChromeMessage({ type: "get_scrap" }, (response) => {
      if (response.status) setScrapData(response.data);
      else setScrapData({});
    });
  const getSetting = () =>
    sendChromeMessage({ type: "get_setting" }, (response) => {
      if (response.status) {
        const data = response.setting;
        setSetting(data);
        setDataFormate(data.exportForm);
        setRemoveDuplicate(data.removeDuplicate);
        setDelay(data.delay);
        setExtractCol(data.extractCol);
        setSelectLang(data.lang ?? "en");
        i18next.changeLanguage(data.lang ?? "en");
      } else message.error(t(response.message));
    });
  const getLicenseDetails = () =>
    sendChromeMessage({ type: "get_details" }, (response) => {
      if (response.status) {
        setIsLicenseValid(true);
        setLicenseMessage("");
      } else {
        setIsLicenseValid(false);
        setLicenseDetails(null);
        setLicenseMessage(response.message);
      }
      if (response.detail) {
        setLicenseDetails(response.detail);
        setName(response.detail.name ?? "");
        setEmail(response.detail.email ?? "");
        setPhone(response.detail.phone ?? "");
        setCity(response.detail.place ?? "");
        setCountry(response.detail.country ?? "IN");
        setKey(response.detail.key ?? "");
      }
      setIsLoading(false);
    });
  const getVersion = () =>
    sendChromeMessage({ type: "get_version" }, (response) =>
      setLocalmanifestVersion(response.version)
    );
  const dateFormat = (dateString) => {
    const expDate = new Date(dateString);
    return `${expDate.getUTCDate()}-${
      expDate.getUTCMonth() + 1
    }-${expDate.getUTCFullYear()}`;
  };
  const expireDate = () =>
    licenseDetails ? dateFormat(licenseDetails.expireAt) : "";

  const get_youtube_thumbnail = (url, quality) => {
    if (url) {
      let video_id, thumbnail, result;
      if ((result = url.match(/youtube\.com.*(\?v=|\/embed\/)(.{11})/))) {
        video_id = result.pop();
      } else if ((result = url.match(/youtu.be\/(.{11})/))) {
        video_id = result.pop();
      }
      if (video_id) {
        const quality_key =
          quality === "low"
            ? "sddefault"
            : quality === "medium"
            ? "mqdefault"
            : "hqdefault";
        return `http://img.youtube.com/vi/${video_id}/${quality_key}.jpg`;
      }
    }
    return false;
  };

  const totalSlider = () => {
    let count = 0;
    if (product) {
      if (product.showAd) count++;
      if (product.demoVideoUrl && product.demoVideoUrl.includes("youtube.com"))
        count++;
    }
    return count;
  };

  const onActivateSubmit = () => {
    setShowValidation(true);
    form
      .validateFields()
      .then(() => {
        sendChromeMessage(
          {
            data: { name, email, phone: `+${phone}`, city, country, key },
            type: "license_active",
          },
          (response) => {
            if (response.status) {
              setIsLicenseValid(true);
              getLicenseDetails();
              message.success(t(response.message));
            } else message.error(t(response.message));
          }
        );
      })
      .catch(() => message.error(t("licenseKeyInvalid")));
  };

  const onSaveSetting = () => {
    setShowValidation(true);
    sendChromeMessage(
      {
        setting: {
          exportForm: dataFormate,
          removeDuplicate,
          delay,
          extractCol,
          lang: selectLang,
        },
        type: "save_setting",
      },
      (response) => {
        if (response.status) {
          message.success(t("settingSave"));
          i18next.changeLanguage(selectLang);
        } else message.error(t("settingSaveFailed"));
      }
    );
  };

  const onScrape = () => {
    setShowValidation(true);
    form
      .validateFields()
      .then(() => {
        sendChromeMessage(
          { keyword: zomatoLink, type: "scrap" },
          (response) => {
            if (response.status) message.success(t(response.message));
            else message.error(t(response.message));
          }
        );
      })
      .catch(() => message.error(t("urlRequired")));
  };

  const onDownloadScrapData = () => {
    sendChromeMessage(
      { type: "download", keyword: selectedKeywordId },
      (response) => {
        if (response.status) {
          message.success(t(response.message));
          setSelectedKeywordId("select");
        } else message.error(t(response.message));
      }
    );
  };

  const onDeleteScrapData = () => {
    sendChromeMessage(
      { type: "delete_scrap", keyword: selectedKeywordId },
      (response) => {
        if (response.status) {
          message.success(t(response.message));
          setSelectedKeywordId("select");
          getScrapeData();
        } else message.error(t(response.message));
      }
    );
  };

  const onClearScrapData = () => {
    sendChromeMessage(
      { type: "clear_scrap", keyword: selectedKeywordId },
      (response) => {
        if (response.status) {
          message.success(t(response.message));
          setScrapData({});
        } else message.error(t(response.message));
      }
    );
  };

  const getTrial = () => {
    sendChromeMessage({ type: "get_trial" }, (response) => {
      console.log("get one day trial demo", response);
      if (response.status) {
        setKey(response.key);
        enqueueSnackbar(response.message, { variant: "success" });
      } else {
        setKey(response.key);
        enqueueSnackbar(response.message, { variant: "error" });
      }
    });
  };

  const renewLicenseKey = () => {
    sendChromeMessage(
      { key: licenseDetails.key, renew_key: renewKey, type: "renew" },
      (response) => {
        if (response.status) {
          message.success(response.message);
          setTimeout(() => setRenewOpen(false), 500);
        } else message.error(t(response.message));
      }
    );
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: theme.primaryColor } }}>
      <div>
        <Modal
          title={t("renewLicense")}
          visible={renewOpen}
          onCancel={() => setRenewOpen(false)}
          footer={[
            <Button key="renew" type="primary" onClick={renewLicenseKey}>
              {t("renew")}
            </Button>,
            product && rData?.active_shop && (
              <Button key="buy">
                <a
                  href={product?.siteUrl || rData?.buy_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("buyNow")}
                </a>
              </Button>
            ),
          ]}
        >
          <Input
            value={renewKey}
            onChange={(e) => setRenewKey(e.target.value)}
            placeholder={t("enterLicenseKey")}
            prefix={<KeyOutlined />}
          />
          <Paragraph>{t("renewDBMbeforeExpire")}</Paragraph>
          <Paragraph>{t("subscription1Y")}</Paragraph>
          <Paragraph>{t("subscription3M")}</Paragraph>
          <Paragraph>{t("subscription1M")}</Paragraph>
        </Modal>

        <div
          style={{
            backgroundColor: theme.primaryColor,
            padding: "20px",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <Space>
            <img
              src={logo}
              alt={product?.name || ""}
              style={{ width: 45, height: 45 }}
            />
            <Title level={4} style={{ color: "#fff", margin: 0 }}>
              {rData?.name || t("ZomatoAppname")}
            </Title>
          </Space>
          {isLicenseValid && (
            <Space style={{ marginTop: 10 }}>
              <Text style={{ color: "#fff" }}>{t("expireDate")}</Text>
              <Tag color="blue">{expireDate()}</Tag>
              <Tag
                color="green"
                onClick={() => setRenewOpen(true)}
                style={{ cursor: "pointer" }}
              >
                {t("renewLabel")}
              </Tag>
            </Space>
          )}
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin
              size="large"
              tip={t("loading")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="mainBox"
            />
          </div>
        ) : (
          <div style={{ padding: "15px" }}>
            {isLicenseValid ? (
              <>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Tabs
                    activeKey={selectedTabId}
                    onChange={setSelectedTabId}
                    style={{ marginTop: "-16px" }}
                  >
                    {TAB_ITEMS?.map((tab) => (
                      <TabPane tab={t(tab)} key={tab}></TabPane>
                    ))}
                  </Tabs>
                </div>
                <div>
                  {selectedTabId === "home" && (
                    <div>
                      <Form form={form} onFinish={onScrape}>
                        <Title level={5} style={{ marginTop: "-5px" }}>
                          {t("welcome")} {licenseDetails?.name || ""}
                        </Title>
                        <Form.Item
                          name="zomatoLink"
                          label={t("zomatoLink")}
                          rules={[
                            {
                              required: true,
                              message: t("keywordIsRequired"),
                            },
                          ]}
                        >
                          <Input
                            value={zomatoLink}
                            onChange={(e) => setZomatoLink(e.target.value)}
                            placeholder={t("enterzomatoLink")}
                          />
                        </Form.Item>
                        <Flex justify="center" style={{ marginTop: -10 }}>
                          <Button type="primary" htmlType="submit">
                            {t("start")}
                          </Button>
                        </Flex>
                      </Form>
                      {product && rData?.show_ads && (
                        <div style={{ marginTop: 20 }}>
                          <Carousel
                            autoplay
                            beforeChange={(from, to) => setActiveStep(to)}
                            style={{ maxWidth: 355 }}
                          >
                            {product.showAd && (
                              <div>
                                <a
                                  href={product.adBannerUrl || ""}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={product.adBannerUrl || ""}
                                    alt={product.adBannerUrl || ""}
                                    style={{
                                      height: 150,
                                      width: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </a>
                              </div>
                            )}
                            {product.demoVideoUrl &&
                              product.demoVideoUrl.includes("youtube.com") && (
                                <div style={{ position: "relative" }}>
                                  <a
                                    href={product.demoVideoUrl || ""}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <PlayCircleOutlined
                                      style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        fontSize: 60,
                                        color: "grey",
                                        opacity: 0.8,
                                      }}
                                    />
                                    <img
                                      src={get_youtube_thumbnail(
                                        product.demoVideoUrl || "",
                                        "high"
                                      )}
                                      alt={product.demoVideoUrl || ""}
                                      style={{
                                        height: 150,
                                        width: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </a>
                                </div>
                              )}
                          </Carousel>
                          <Flex
                            justify="space-between"
                            style={{ marginTop: 10 }}
                          >
                            <Button
                              onClick={() =>
                                setActiveStep((prev) => Math.max(prev - 1, 0))
                              }
                              disabled={activeStep === 0}
                            >
                              {t("back")}
                            </Button>
                            <Button
                              onClick={() =>
                                setActiveStep((prev) =>
                                  Math.min(prev + 1, totalSlider() - 1)
                                )
                              }
                              disabled={activeStep === totalSlider() - 1}
                            >
                              {t("next")}
                            </Button>
                          </Flex>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedTabId === "data" && (
                    <div>
                      {Object.keys(scrapData).length === 0 ? (
                        <Alert message={t("noDataFound")} type="warning" />
                      ) : (
                        <>
                          <Form.Item label={t("keyword")}>
                            <Select
                              value={selectedKeywordId}
                              onChange={setSelectedKeywordId}
                            >
                              <Option value="select">Select</Option>
                              {Object.keys(scrapData)?.map((key) => (
                                <Option key={key} value={key}>
                                  {scrapData[key].name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                          {selectedKeywordId !== "select" && (
                            <>
                              <Paragraph>
                                {t("totalData")}:{" "}
                                {
                                  (scrapData[selectedKeywordId]?.data || [])
                                    .length
                                }
                              </Paragraph>
                              <Paragraph>
                                {t("lastDate")}:{" "}
                                {dateFormat(
                                  scrapData[selectedKeywordId]?.createdAt
                                )}
                              </Paragraph>
                              <Space
                                style={{
                                  justifyContent: "center",
                                  display: "flex",
                                }}
                              >
                                <Button
                                  type="primary"
                                  onClick={onDownloadScrapData}
                                >
                                  {t("download")}
                                </Button>
                                <Button danger onClick={onDeleteScrapData}>
                                  {t("delete")}
                                </Button>
                              </Space>
                            </>
                          )}
                          <Flex justify="center" style={{ marginTop: "10px" }}>
                            <Button danger onClick={onClearScrapData}>
                              {t("clearAll")}
                            </Button>
                          </Flex>
                        </>
                      )}
                    </div>
                  )}
                  {selectedTabId === "setting" && (
                    <Form onFinish={onSaveSetting}>
                      <Form.Item
                        label={t("removeDuplicate")}
                        style={{ marginTop: "-12px" }}
                      >
                        <Select
                          value={removeDuplicate}
                          onChange={setRemoveDuplicate}
                        >
                          <Option value="only_phone">{t("onlyPhone")}</Option>
                          <Option value="only_address">
                            {t("onlyAddress")}
                          </Option>
                          <Option value="phone_and_address">
                            {t("phoneAndaddress")}
                          </Option>
                        </Select>
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={12} style={{ marginTop: "-20px" }}>
                          <Form.Item label={t("delay")}>
                            <Input
                              type="number"
                              value={delay}
                              onChange={(e) => setDelay(e.target.value)}
                              min={1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12} style={{ marginTop: "-20px" }}>
                          <Form.Item label={t("language")}>
                            <Select showSearch value={selectLang} onChange={setSelectLang}>
                              {langList?.map((lang) => (
                                <Option key={lang.key} value={lang.key}>
                                  {lang.name}
                                </Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Title level={5} style={{ marginTop: "-12px" }}>
                        {t("extractingCol")}
                      </Title>
                      <Row gutter={[16, 16]}>
                        {columns?.map((col) => (
                          <Col span={12} key={col.value}>
                            <Checkbox
                              checked={extractCol[col.value]}
                              onChange={(e) =>
                                setExtractCol((prev) => ({
                                  ...prev,
                                  [col.value]: e.target.checked,
                                }))
                              }
                            >
                              {t(col.label)}
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                      <Flex justify="center">
                        <Button type="primary" htmlType="submit">
                          {t("save")}
                        </Button>
                      </Flex>
                    </Form>
                  )}
                  {selectedTabId === "help" && (
                    <div style={{ marginTop: "-20px" }}>
                      <Title level={5}>{t("helpMsg")}</Title>
                      <Paragraph>{t("contactWithEmail")}</Paragraph>
                      <List
                        dataSource={[
                          {
                            icon: <PhoneOutlined />,
                            title: t("phone"),
                            content: rData?.active_shop
                              ? product?.contactNumber
                              : rData?.phone,
                            href: `tel:${
                              rData?.active_shop
                                ? product?.contactNumber
                                : rData?.phone
                            }`,
                          },
                          {
                            icon: <MailOutlined />,
                            title: t("email"),
                            content: rData?.active_shop
                              ? product?.email
                              : rData?.email,
                            href: `mailto:${
                              rData?.active_shop ? product?.email : rData?.email
                            }`,
                          },
                          {
                            icon: <GlobalOutlined />,
                            title: t("website"),
                            content: rData?.active_shop
                              ? product?.siteUrl
                              : rData?.siteUrl,
                            href: rData?.active_shop
                              ? product?.siteUrl
                              : rData?.siteUrl,
                          },
                        ].filter((item) => item.content)}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar icon={item.icon} />}
                              title={item.title}
                              description={
                                <a
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {item.content}
                                </a>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </div>
                <Text
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >{`V ${localmanifestVersion?.localVersion || ""}`}</Text>
              </>
            ) : (
              <Form form={form} onFinish={onActivateSubmit}>
                {licenseMessage && (
                  <Alert message={t(licenseMessage)} type="warning" />
                )}
                <Form.Item
                  name="name"
                  // label={t("name")}
                  rules={[{ required: true, message: t("nameRequired") }]}
                >
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    prefix={<HomeOutlined />}
                    placeholder={t("enterName")}
                  />
                </Form.Item>
                <Form.Item
                  name="email"
                  // label={t("emailAddress")}
                  rules={[
                    { required: true, message: t("emailRequired") },
                    { type: "email", message: t("emailInvalid") },
                  ]}
                >
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    prefix={<MailOutlined />}
                    placeholder={t("enterEmail")}
                  />
                </Form.Item>
                <Form.Item
                  name="phone"
                  // label={t("phone")}
                  rules={[{ required: true, message: t("phoneRequired") }]}
                >
                  <PhoneInput
                    country="in"
                    value={phone}
                    onChange={setPhone}
                    inputStyle={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item
                  name="city"
                  // label={t("city")}
                  rules={[{ required: true, message: t("cityRequired") }]}
                >
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    prefix={<HomeOutlined />}
                    placeholder={t("enterCity")}
                  />
                </Form.Item>
                <Form.Item
                  name="country"
                  // label={t("country")}
                  validateStatus={country || !showValidation ? "" : "error"}
                  rules={[{ required: true, message: t("countryRequired") }]}
                >
                  <Select
                  showSearch
                    onChange={setCountry}
                    defaultValue={"india"}
                    value={country ?? "IN"}
                    placeholder={t("selectCountry")}
                  >
                    {countryList?.map((c) => (
                      <Option key={c.countryCode} value={c.countryNameEn}>
                        {c.countryNameEn}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="key"
                  // label={t("licenseKey")}
                  validateStatus={
                    key && keyIsValid
                      ? "success"
                      : key && !keyIsValid
                      ? "error"
                      : ""
                  }
                  help={key && !keyIsValid ? licenceKeyErrorMessage : ""}
                  rules={[{ required: true, message: t("licenseKeyRequired") }]}
                >
                  <Input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    prefix={<KeyOutlined />}
                    suffix={
                      keyIsValid ? (
                        <CheckCircleOutlined style={{ color: "green" }} />
                      ) : (
                        <CheckCircleOutlined style={{ color: "gray" }} />
                      )
                    }
                    placeholder={t("enterLicenseKey")}
                  />
                </Form.Item>
                <Row
                  justify="end"
                  align="middle"
                  style={{ cursor: "pointer", marginTop: -2, marginRight: 1 }}
                >
                  <Text onClick={getTrial} style={{marginTop: -20,cursor: "pointer" }}>{t("getTrial")}</Text>
                </Row>
                <Form.Item>
                  {/* <Space> */}
                  <Flex justify="center" gap={20} style={{ marginTop: "15px" }}>
                    <Button type="primary" htmlType="submit">
                      {t("activate")}
                    </Button>
                    {product && rData?.active_shop && (
                      <Button>
                        <a
                          href={product?.siteUrl || rData?.buy_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("buyNow")}
                        </a>
                      </Button>
                    )}
                    {/* </Space> */}
                  </Flex>
                </Form.Item>
              </Form>
            )}
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};
export default FormComponent;
