import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;
import java.util.Scanner;

public class JavaSwing {
    public static void main(String[] args) {
        // Create Frame
        JFrame frame = new JFrame("Login");
        frame.setSize(350, 200);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLayout(new GridLayout(3, 2));

        // Create Labels and Fields
        JLabel emailLabel = new JLabel("Email:");
        JTextField emailField = new JTextField();
        JLabel passwordLabel = new JLabel("Password:");
        JPasswordField passwordField = new JPasswordField();
        JButton loginButton = new JButton("Login");

        // Add Components to Frame
        frame.add(emailLabel);
        frame.add(emailField);
        frame.add(passwordLabel);
        frame.add(passwordField);
        frame.add(new JLabel()); // Empty space
        frame.add(loginButton);

        // Login Button Action
        loginButton.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                String email = emailField.getText();
                String password = new String(passwordField.getPassword());

                if (email.isEmpty() || password.isEmpty()) {
                    JOptionPane.showMessageDialog(frame, "Please enter email and password");
                    return;
                }

                try {
                    // API Request
                    URL url = new URL("http://localhost:8080/api/users/login");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);

                    // Create JSON Body
                    JSONObject json = new JSONObject();
                    json.put("email", email);
                    json.put("password", password);

                    // Send Request
                    OutputStream os = conn.getOutputStream();
                    os.write(json.toString().getBytes());
                    os.flush();
                    os.close();

                    // Read Response
                    Scanner scanner = new Scanner(conn.getInputStream());
                    StringBuilder response = new StringBuilder();
                    while (scanner.hasNext()) {
                        response.append(scanner.nextLine());
                    }
                    scanner.close();

                    // Handle Response
                    if (conn.getResponseCode() == 200) {
                        JOptionPane.showMessageDialog(frame, "Login Successful!");
                        System.out.println("JWT Token: " + response.toString());
                    } else {
                        JOptionPane.showMessageDialog(frame, "Login Failed!");
                    }

                    conn.disconnect();
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(frame, "Error: " + ex.getMessage());
                    ex.printStackTrace();
                }
            }
        });

        // Show Frame
        frame.setVisible(true);
    }
}
