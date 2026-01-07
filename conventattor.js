import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import java.io.*;
import javax.imageio.ImageIO;

public class VtfConverter extends JFrame {
    private JTextField filePath = new JTextField(20);
    private JComboBox<String> widthSetting = new JComboBox<>(new String[]{"auto", "1024", "768", "720", "512", "256", "128", "64", "32", "16", "8", "4", "custom"});
    private JTextField widthCus = new JTextField("1024");
    private JComboBox<String> heightSetting = new JComboBox<>(new String[]{"auto", "1024", "768", "720", "512", "256", "128", "64", "32", "16", "8", "4", "custom"});
    private JTextField heightCus = new JTextField("1024");
    private JComboBox<String> format = new JComboBox<>(new String[]{"RGBA8888", "RGB888", "RGB565", "BGRA5551", "BGRA4444", "DXT1", "DXT5"});
    private JCheckBox mipmapsCheck = new JCheckBox("Генерувати міпмапи");
    private JCheckBox rescaleCheck = new JCheckBox("Масштабувати", true);
    private JButton convertButton = new JButton("Скачати VTF");
    private JLabel preview = new JLabel();
    private File selectedFile;

    public VtfConverter() {
        setTitle("VTF Spray Converter");
        setLayout(new GridLayout(4, 1));
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        JPanel upload = new JPanel();
        JButton choose = new JButton("Завантаж картинку");
        choose.addActionListener(e -> chooseFile());
        upload.add(choose);
        upload.add(filePath);
        add(upload);

        JPanel settings = new JPanel(new GridLayout(3, 2));
        settings.add(new JLabel("Ширина:"));
        settings.add(widthSetting);
        settings.add(new JLabel("Висота:"));
        settings.add(heightSetting);
        settings.add(new JLabel("Формат:"));
        settings.add(format);
        add(settings);

        JPanel checks = new JPanel();
        checks.add(mipmapsCheck);
        checks.add(rescaleCheck);
        add(checks);

        JPanel buttons = new JPanel();
        convertButton.addActionListener(e -> convertVTF());
        buttons.add(convertButton);
        add(buttons);

        add(new JScrollPane(preview), BorderLayout.CENTER);

        widthSetting.addActionListener(e -> toggleCus());
        heightSetting.addActionListener(e -> toggleCus());

        pack();
        setVisible(true);
    }

    private void chooseFile() {
        JFileChooser fc = new JFileChooser();
        if (fc.showOpenDialog(this) == JFileChooser.APPROVE_OPTION) {
            selectedFile = fc.getSelectedFile();
            filePath.setText(selectedFile.getPath());
            showPreview();
        }
    }

    private void showPreview() {
        try {
            BufferedImage img = ImageIO.read(selectedFile);
            preview.setIcon(new ImageIcon(img.getScaledInstance(512, 512, Image.SCALE_SMOOTH)));
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Помилка прев'ю");
        }
    }

    private void toggleCus() {
        widthCus.setVisible(widthSetting.getSelectedItem().equals("custom"));
        heightCus.setVisible(heightSetting.getSelectedItem().equals("custom"));
        pack();
    }

    private void convertVTF() {
        if (selectedFile == null) return;

        String w = (String) widthSetting.getSelectedItem();
        if (w.equals("custom")) w = widthCus.getText();
        String h = (String) heightSetting.getSelectedItem();
        if (h.equals("custom")) h = heightCus.getText();

        String fmt = (String) format.getSelectedItem();
        String vtfFmt = getVtfFormat(fmt);

        String cmd = "VTFCmd.exe -file \"" + selectedFile.getPath() + "\" -output . -format " + vtfFmt;
        if (mipmapsCheck.isSelected()) cmd += " -mipmaps";
        if (rescaleCheck.isSelected()) cmd += " -resize -resizeMethod 1 -resizeWidth " + w + " -resizeHeight " + h; // approx

        try {
            Process p = Runtime.getRuntime().exec(cmd);
            p.waitFor();
            JOptionPane.showMessageDialog(this, "Готово! Файл spray.vtf");
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Помилка: " + ex.getMessage());
        }
    }

    private String getVtfFormat(String fmt) {
        switch (fmt) {
            case "RGBA8888": return "RGBA8888";
            case "RGB888": return "RGB888";
            case "RGB565": return "RGB565";
            case "BGRA5551": return "BGRA5551";
            case "BGRA4444": return "BGRA4444";
            case "DXT1": return "DXT1";
            case "DXT5": return "DXT5";
            default: return "DXT1";
        }
    }

    public static void main(String[] args) {
        new VtfConverter();
    }
}
