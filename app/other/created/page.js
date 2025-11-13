import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const created = () => {
  return (
    <div className="w-full p-4">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>만든사람</FieldLegend>
            <FieldDescription>정영균</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                  현재 일하고 있는 곳
                </FieldLabel>
                <Input
                  className="w-full"
                  id="checkout-7j9-card-name-43j"
                  value="GRM (서울도시가스그룹)"
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  하는일
                </FieldLabel>
                <Input
                  id="checkout-7j9-card-number-uw1"
                  value="React 개발자"
                  readOnly
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-optional-comments">
                  Comments
                </FieldLabel>
                <Textarea
                  id="checkout-7j9-optional-comments"
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};

export default created;
