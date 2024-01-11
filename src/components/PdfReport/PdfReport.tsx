import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  image: { marginHorizontal: 10 },
  title: {
    margin: 12,
    fontSize: 24,
    textAlign: "center",
  },
  author: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 40,
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
    color: "grey",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});

interface PdfReportProps {
  base64Image: string;
  author: string;
}

const PdfReport = ({ base64Image, author }: PdfReportProps) => {
  const { t } = useTranslation();
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{t("Report")}</Text>
      <Text style={styles.author} fixed>
        {t("Generated with DecisionAssistant by")} {author}
      </Text>

      <View style={styles.image}>
        <Image src={base64Image} />
      </View>

      <Text style={styles.section}>Text</Text>

      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        fixed
      />
    </Page>
  </Document>
)};

export default PdfReport;
