argPath=$1
argThreshold=$2

go test -cover $argPath -coverprofile=cover.out

tests=`go tool cover -func=cover.out`
failed=false

echo "Threshold: $argThreshold"

while IFS= read -r t
do
  num=`echo $t | grep -Eo '[0-9]+\.[0-9]+'`
  if (( $(echo "$num < $argThreshold" | bc -l) )) ; then
    COLOR=red;
    failed=true
    echo $t;
  else
    COLOR=green;
    echo $t;
  fi
done <<< "$tests"

if $failed ; then
  echo "Failed"
  exit 1
fi
