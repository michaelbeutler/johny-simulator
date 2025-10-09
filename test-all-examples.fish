#!/usr/bin/env fish

# Test script to compile and verify all Johnny C examples
set examples_dir jcc
set failed_count 0

echo "🔧 Testing all Johnny C examples..."
echo

for jcc_file in $examples_dir/*.jcc
    set basename (basename $jcc_file .jcc)
    set ram_file $examples_dir/$basename.ram
    
    echo "📝 Compiling $jcc_file..."
    if bun run compile $jcc_file --print-vars
        echo "✅ $basename.jcc compiled successfully"
        
        # Check if .ram file was generated
        if test -f $ram_file
            echo "📄 Generated $ram_file"
        else
            echo "❌ Missing output file $ram_file"
            set failed_count (math $failed_count + 1)
        end
    else
        echo "❌ Failed to compile $basename.jcc"
        set failed_count (math $failed_count + 1)
    end
    echo
end

echo "📊 Test Summary:"
if test $failed_count -eq 0
    echo "🎉 All examples compiled successfully!"
else
    echo "❌ $failed_count examples failed to compile"
end