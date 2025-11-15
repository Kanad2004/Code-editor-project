export const CODE_TEMPLATES = {
  cpp: `// C++ Template
#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    // Your code here
    cout << "Hello, World!" << endl;
    return 0;
}`,
  
  java: `// Java Template
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Your code here
        System.out.println("Hello, World!");
        sc.close();
    }
}`,
  
  python: `# Python Template
def main():
    # Your code here
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  
  javascript: `// JavaScript Template
function main() {
    // Your code here
    console.log("Hello, World!");
}

main();`
};

export const LANGUAGE_OPTIONS = [
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
];
