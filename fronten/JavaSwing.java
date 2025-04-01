import javax.swing.*;
import java.awt.*;

public class JavaSwing {
    public static void main(String[] args) {
        // Create Frame
        JFrame frame = new JFrame("Login");
        frame.setSize(400, 500);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocationRelativeTo(null);
        frame.setLayout(null);

        // Create Background Panel
        JPanel panel = new JPanel();
        panel.setBounds(0, 0, 400, 500);
        panel.setLayout(null);
        panel.setBackground(new Color(255, 240, 200)); // Light orange background

        // Logo Label
        JLabel logoLabel = new JLabel(new ImageIcon("logo.png")); // Load logo image
        logoLabel.setBounds(100, 30, 200, 80);
        panel.add(logoLabel);

        // Login Title
        JLabel loginLabel = new JLabel("LOGIN");
        loginLabel.setFont(new Font("Arial", Font.BOLD, 20));
        loginLabel.setForeground(new Color(255, 100, 0)); // Orange color
        loginLabel.setBounds(160, 120, 100, 30);
        panel.add(loginLabel);

        // Username Field
        JTextField usernameField = new JTextField("Username");
        usernameField.setBounds(80, 170, 240, 40);
        usernameField.setFont(new Font("Arial", Font.PLAIN, 16));
        usernameField.setForeground(Color.GRAY);
        panel.add(usernameField);

        // Password Field
        JPasswordField passwordField = new JPasswordField("Password");
        passwordField.setBounds(80, 220, 240, 40);
        passwordField.setFont(new Font("Arial", Font.PLAIN, 16));
        passwordField.setForeground(Color.GRAY);
        panel.add(passwordField);

        // Sign Up and Forgot Password Links
        JLabel signUpLabel = new JLabel("Sign Up");
        signUpLabel.setForeground(Color.BLUE);
        signUpLabel.setBounds(80, 270, 60, 20);
        panel.add(signUpLabel);

        JLabel forgotLabel = new JLabel("Forgot password?");
        forgotLabel.setForeground(Color.BLUE);
        forgotLabel.setBounds(220, 270, 120, 20);
        panel.add(forgotLabel);

        // Submit Button
        JButton submitButton = new JButton("SUBMIT");
        submitButton.setBounds(120, 310, 160, 40);
        submitButton.setBackground(new Color(255, 100, 0)); // Orange color
        submitButton.setForeground(Color.WHITE);
        submitButton.setFont(new Font("Arial", Font.BOLD, 16));
        panel.add(submitButton);

        // Add Panel to Frame
        frame.add(panel);
        frame.setVisible(true);
    }
}
